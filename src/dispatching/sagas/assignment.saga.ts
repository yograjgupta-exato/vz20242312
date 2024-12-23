import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { JobDispatchedToProviderEvent } from '../events/job-dispatched-to-provider.event';
import { PubNotifyIncomingNewJobCommand } from 'pub-sub/commands/pub-notify-incoming-new-job.command';
import { PushNotifyIncomingNewJobCommand } from 'push-notification/commands/push-notify-incoming-new-job.command';

@Injectable()
export class AssignmentSaga {
    @Saga()
    jobDispatched = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(JobDispatchedToProviderEvent),
            map(({ providerId, job }) => {
                const commands: ICommand[] = [
                    new PushNotifyIncomingNewJobCommand(providerId, job),
                    new PubNotifyIncomingNewJobCommand(providerId, job),
                ];
                return commands;
            }),
            flatMap(cs => cs),
        );
    };
}
