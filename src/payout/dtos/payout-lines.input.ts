import { ApiProperty } from '@nestjs/swagger';
import moment = require('moment');

export class MarkPayoutLinesAsPaidInput {
    @ApiProperty({
        description: 'The Service Request Id.',
        example: '200727-rd6y11k',
    })
    serviceRequestId: string;

    @ApiProperty({
        description: 'The Service Provider SAP Vendor Id.',
        example: '15453',
    })
    serviceProviderVendorId: string;

    @ApiProperty({
        description: 'The SAP Payment Document No.',
        example: '2000001234',
    })
    sapDocumentPaymentNo: string;

    @ApiProperty({
        description: 'Payment Date.',
        example: moment().format('DD/M/YYYY'),
    })
    paymentDate: string;
}
