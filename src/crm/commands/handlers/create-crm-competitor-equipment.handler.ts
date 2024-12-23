import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCRMCompetitorEquipmentCommand } from '../create-crm-competitor-equipment.command';
import { CRMService } from 'crm/crm.service';

@CommandHandler(CreateCRMCompetitorEquipmentCommand)
export class CreateCRMCompetitorEquipmentHandler implements ICommandHandler<CreateCRMCompetitorEquipmentCommand> {
    constructor(private readonly crmService: CRMService) {}
    private readonly logger = new Logger(CreateCRMCompetitorEquipmentHandler.name);

    async execute(command: CreateCRMCompetitorEquipmentCommand): Promise<void> {
        const { input } = command;
        try {
            await this.crmService.createCompetitorEquipment(input);
        } catch (err) {
            this.logger.error(err);
        }
    }
}
