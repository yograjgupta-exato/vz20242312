export class ApplyPromoCodeCommand {
    constructor(public readonly promoCode: string, public readonly totalAmount: number, public forCommit: boolean = false) {
        this.promoCode = promoCode.toLowerCase();
    }
}
