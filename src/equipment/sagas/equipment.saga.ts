import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateCRMCompetitorEquipmentCommand } from 'crm/commands/create-crm-competitor-equipment.command';
import { CRMCompetitorEquipmentDto } from 'crm/dtos/crm-competitor-equipment.dto';
import { EquipmentCreatedEvent } from 'equipment/events/equipment.event';

@Injectable()
export class EquipmentSaga {
    @Saga()
    equipmentCreated = (events$: Observable<any>): Observable<ICommand> => {
        return events$.pipe(
            ofType(EquipmentCreatedEvent),
            map(({ equipment }) => new CreateCRMCompetitorEquipmentCommand(CRMCompetitorEquipmentDto.fromUberEquipment(equipment))),
        );
    };
}
