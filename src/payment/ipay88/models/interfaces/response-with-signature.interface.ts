export interface IResponseWithSignature {
    Signature?: string;
    isSignatureValid(merchantKey: string): boolean;
}