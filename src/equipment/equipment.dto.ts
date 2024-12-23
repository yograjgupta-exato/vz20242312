import { OmitType } from '@nestjs/swagger';
import { Equipment } from './equipment.entity';

export class CreateEquipmentInput extends OmitType(Equipment, ['id', 'crmCustomerId', 'providerId', 'createdAt', 'updatedAt']) {}
