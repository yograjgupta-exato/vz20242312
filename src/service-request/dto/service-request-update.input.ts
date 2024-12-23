import { PartialType } from '@nestjs/swagger';
import { ServiceRequestInput } from './service-request.input';

export class ServiceRequestUpdateInput extends PartialType(ServiceRequestInput) { }
