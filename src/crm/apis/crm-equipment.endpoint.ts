import { Logger } from '@nestjs/common';
import { CRMEquipmentDto } from '../dtos/crm-equipment.dto';
import { RegisterCrmWarrantyEquipmentsInput } from '../inputs/register-crm-warranty-equipments.input';
import { AbstractEndpoint } from './abstract.endpoint';

export class CRMEquipmentEndpoint extends AbstractEndpoint {
    private readonly logger = new Logger(CRMEquipmentEndpoint.name);

    /**
     * Get equipments by serialNo.
     * @param serialId Daikin/Acson Equipment Serial Number
     */
    async getEquipmentsByQuery(query: { serialId: string }): Promise<CRMEquipmentDto[]> {
        let filter = '';

        if (query.serialId) {
            filter = `$filter=SerialID eq '${query.serialId}'`;
        }

        const raw = await this.execute({
            collection: `RegisteredProductCollection?${filter}`,
            method: 'GET',
            entity: null,
        });

        const results = raw?.d?.results || [];
        if (results.length < 1) {
            return [];
        }
        return CRMEquipmentDto.fromC4CResponses(results);
    }

    async getEquipmentByObjectId(equipmentObjectId: string): Promise<CRMEquipmentDto> {
        const raw = await this.client.newRequest({
            collection: `RegisteredProductCollection('${equipmentObjectId}')`,
            method: 'GET',
        });

        const result = raw?.d?.results;
        if (!result) {
            return null;
        }

        return CRMEquipmentDto.fromC4CResponse(result);
    }

    async registerEquipmentToWarranty(equipmentObjectId: string, input: RegisterCrmWarrantyEquipmentsInput): Promise<CRMEquipmentDto> {
        return await this.execute({
            collection: `RegisteredProductCollection('${equipmentObjectId}')`,
            method: 'PATCH',
            entity: input.toC4CPayload(),
        });
    }

    async registerEquipmentsToWarranty(equipmentObjectIds: string[], input: RegisterCrmWarrantyEquipmentsInput): Promise<CRMEquipmentDto[]> {
        // note(roy): raw.status = 404 if not found.
        await this.client.execBatchRequests(
            equipmentObjectIds.map(id => {
                return this.client.newBatchRequest({
                    collection: `RegisteredProductCollection('${id}')`,
                    method: 'PATCH',
                    entity: input.toC4CPayload(),
                });
            })
        );

        const rawFromBatchGet = await this.client.execBatchRequests(
            equipmentObjectIds.map(id => {
                return this.client.newBatchRequest({
                    collection: `RegisteredProductCollection('${id}')`,
                    method: 'GET',
                });
            })

        );
        const results = [];
        for (const r of rawFromBatchGet) {
            if (r.status === 200) {
                const result = await (await r.json()).d.results;
                if (!result) {
                    continue;
                }
                results.push(result);
            }
        }
        return results.length > 0 ? CRMEquipmentDto.fromC4CResponses(results) : [];
    }
}
