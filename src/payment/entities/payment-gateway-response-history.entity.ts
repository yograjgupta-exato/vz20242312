import { PaymentGatewayResponse } from './payment-gateway-response.entity';

export class PaymentGatewayResponseHistory {
    public static readonly EMPTY = new PaymentGatewayResponseHistory(new Array<PaymentGatewayResponse>());

    public constructor(public readonly responses: PaymentGatewayResponse[]) {}

    public mostRecentResponse(): PaymentGatewayResponse {
        const sortedResponses = this.responses.slice();
        if (sortedResponses.length < 1) {
            return null;
        }

        sortedResponses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return sortedResponses[sortedResponses.length - 1];
    }
}
