export class SendSecurityCodeCommand {
    constructor(
        public readonly securityCode: string,
        public readonly technicianName: string,
        public readonly principalGroupName: string,
        public readonly customerPhoneNumber: string,
    ) {}
}
