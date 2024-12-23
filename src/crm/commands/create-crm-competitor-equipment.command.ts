import { CRMCompetitorEquipmentDto } from 'crm/dtos/crm-competitor-equipment.dto';
export class CreateCRMCompetitorEquipmentCommand {
    constructor(public readonly input: CRMCompetitorEquipmentDto) {}
}
