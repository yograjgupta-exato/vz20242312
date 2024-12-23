import { OmitType } from '@nestjs/swagger';
import { CustomerRescheduleOrder } from '../entities/customer-reschedule-order.entity';

export class CustomerRescheduleOrderDto extends OmitType(CustomerRescheduleOrder, ['customerRescheduleOrderPaymentGatewayResponse']) {}
