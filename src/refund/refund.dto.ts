import { OmitType } from '@nestjs/swagger';
import { Refund } from './refund.entity';

export class RefundInput extends OmitType(Refund, ['id']) {}
