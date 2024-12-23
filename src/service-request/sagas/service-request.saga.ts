// eslint-disable-next-line max-len
import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map, flatMap, filter } from 'rxjs/operators';
import {
    ServiceRequestStartedEvent,
    ServiceRequestWorkCommencedEvent,
    ServiceRequestCancelledEvent,
    ServiceRequestAssignedEvent,
    ServiceRequestConfirmedEvent,
    ServiceRequestFulfilledEvent,
    ServiceRequestCreatedEvent,
    ServiceRequestReadyForCRMEvent,
    ServiceRequestRevokedEvent,
    ServiceRequestRescheduledEvent,
    ServiceRequestAllocatedEvent,
} from '@cqrs/events/service-request.event';
import { UserType } from '@shared/enums';
import { FindAndPatchCRMCustomerIdCommand } from '@service-request/commands/find-and-patch-crm-customer-id.command';
import { CreateIncomeTransactionCommand } from '@wallet/commands/create-income-transaction.command';
import { EmailNotifyCustomerRescheduledCommand } from '../../email/commands/email-notify-customer-rescheduled.command';
import { PushNotifyCustomerRescheduledCommand } from '../../push-notification/commands/push-notify-customer-rescheduled.command';
import { SendCompletionVerificationCodeCommand } from '../../sms/commands/send-completion-verification-code.command';
// eslint-disable-next-line max-len
import { CreateRescheduleSurchargeCompensationTransactionCommand } from '../../wallet/commands/create-reschedule-surcharge-compensation-transaction.command';
import { CreateCRMServiceRequestCommand } from 'crm/commands/create-crm-service-request.command';
import { InitiateAutoAssignmentCommand } from 'dispatching/commands/initiate-auto-assignment.command';
import { PushNotifyCustomerCancellationCommand } from 'push-notification/commands/push-notify-customer-cancellation.command';
import { PushNotifyJobAssignmentCommand } from 'push-notification/commands/push-notify-job-assignment.command';
import { SendSecurityCodeCommand } from 'sms/commands/send-security-code.command';

@Injectable()
export class ServiceRequestSaga {
    @Saga()
    serviceRequestCreated = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestCreatedEvent),
            map(({ serviceRequest }) => new FindAndPatchCRMCustomerIdCommand(serviceRequest.getId())),
        );
    };

    @Saga()
    serviceRequestReadyForCRM = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestReadyForCRMEvent),
            map(({ serviceRequest }) => new CreateCRMServiceRequestCommand(serviceRequest.getId())),
        );
    };

    @Saga()
    serviceRequestConfirmed = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestConfirmedEvent),
            map(({ serviceRequest, initiateDispatchSequence }) => {
                const commands: ICommand[] = [];
                if (initiateDispatchSequence) {
                    commands.push(new InitiateAutoAssignmentCommand(serviceRequest.getId()));
                }
                return commands;
            }),
            flatMap(cs => cs),
        );
    };

    @Saga()
    serviceRequestStarted = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestStartedEvent),
            map(({ serviceRequest }) => {
                const dto = serviceRequest.toDto();
                const commands: ICommand[] = [
                    new SendSecurityCodeCommand(
                        dto.securityCode,
                        dto.service.provider.worker.name,
                        dto.principalGroupName,
                        dto.customerContact.phone,
                    ),
                ];
                return commands;
            }),
            flatMap(cs => cs),
        );
    };

    @Saga()
    serviceRequestWorkCommenced = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestWorkCommencedEvent),
            map(({ serviceRequest }) => {
                const dto = serviceRequest.toDto();
                const commands: ICommand[] = [
                    new SendCompletionVerificationCodeCommand(dto.verificationCode, dto.principalGroupName, dto.customerContact.phone),
                ];
                return commands;
            }),
            flatMap(cs => cs),
        );
    };

    @Saga()
    serviceRequestCancelledByCustomer = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestCancelledEvent),
            filter(({ by }) => by === UserType.CUSTOMER),
            map(({ serviceRequest, providerId, workerId }) => {
                const commands: ICommand[] = [new PushNotifyCustomerCancellationCommand(providerId, serviceRequest.toDto())];
                if (workerId && providerId !== workerId) {
                    commands.push(new PushNotifyCustomerCancellationCommand(workerId, serviceRequest.toDto()));
                }
                return commands;
            }),
            flatMap(cs => cs),
        );
    };

    // todo(roy): add service-request rescheduled saga to:  1)send email & notification.
    //
    // todo(roy): after cancel(provider, customer, operator), check if it already update appointment status, to free sp.
    // terminate provider from sp before rebroadcast.
    @Saga()
    serviceRequestCancelledByProvider = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestCancelledEvent),
            filter(({ by }) => by === UserType.PROVIDER),
            map(({ serviceRequest }) => {
                const commands: ICommand[] = [new InitiateAutoAssignmentCommand(serviceRequest.getId())];
                return commands;
            }),
            flatMap(cs => cs),
        );
    };

    @Saga()
    serviceRequestRevokedByOperator = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestRevokedEvent),
            map(({ serviceRequest, providerId }) => {
                const commands: ICommand[] = [new PushNotifyCustomerCancellationCommand(providerId, serviceRequest.toDto())];

                if (serviceRequest.hasBeenMarkAsFailed()) {
                    commands.push(new CreateRescheduleSurchargeCompensationTransactionCommand(serviceRequest.getId()));
                } else {
                    commands.push(new InitiateAutoAssignmentCommand(serviceRequest.getId()));
                }
                return commands;
            }),
            flatMap(cs => cs),
        );
    };

    @Saga()
    serviceRequestAssigned = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestAssignedEvent),
            map(
                ({ serviceRequest }) => new PushNotifyJobAssignmentCommand(serviceRequest.getServiceProvider().dispatcher.id, serviceRequest.toDto()),
            ),
        );
    };

    @Saga()
    serviceRequestAllocated = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestAllocatedEvent),
            filter(({ serviceRequest }) => !serviceRequest.isServiceProviderIndependent()),
            map(({ serviceRequest }) => new PushNotifyJobAssignmentCommand(serviceRequest.getServiceProvider().worker.id, serviceRequest.toDto())),
        );
    };

    @Saga()
    serviceRequestFulfilled = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestFulfilledEvent),
            map(({ serviceRequest }) => {
                const commands: ICommand[] = [
                    new CreateIncomeTransactionCommand(serviceRequest.getId()),
                    new CreateRescheduleSurchargeCompensationTransactionCommand(serviceRequest.getId()),
                ];
                return commands;
            }),
            flatMap(cs => cs),
        );
    };

    @Saga()
    serviceRequestRescheduled = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(ServiceRequestRescheduledEvent),
            map(({ serviceRequest }) => {
                const commands: ICommand[] = [
                    new PushNotifyCustomerRescheduledCommand(
                        serviceRequest.getCustomerRescheduleOrder()?.impactedServiceProviderId,
                        serviceRequest.toDto(),
                    ),
                    new EmailNotifyCustomerRescheduledCommand(serviceRequest.toDto()),
                    new InitiateAutoAssignmentCommand(serviceRequest.getId()),
                ];
                return commands;
            }),
            flatMap(cs => cs),
        );
    };
}
