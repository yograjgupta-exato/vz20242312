import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HoldBalanceForPayoutCommand } from '@wallet/commands/hold-balance-for-payout.command';
import { ReleaseBalanceForPayoutCommand } from '@wallet/commands/release-balance-for-payout.command';
import { PayoutPaidEvent, PayoutScheduledEvent } from '@payout/events/payout.event';

@Injectable()
export class PayoutSaga {
    @Saga()
    payoutScheduled = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(PayoutScheduledEvent),
            map(({ payout }) => new HoldBalanceForPayoutCommand(payout.getId())),
        );
    };

    @Saga()
    payoutPaid = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(PayoutPaidEvent),
            map(({ payout }) => new ReleaseBalanceForPayoutCommand(payout.getId())),
        );
    };
}
