export interface IRequestWithSignature {
    Signature?: string;
    updateSignature(merchantKey: string): this;
}