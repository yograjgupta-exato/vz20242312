import { Logger } from '@nestjs/common';
import { CRMCompetitorEquipmentDto } from '../dtos/crm-competitor-equipment.dto';
import { AbstractEndpoint } from './abstract.endpoint';
export class CRMCompetitorEquipmentEndpoint extends AbstractEndpoint {
    private readonly logger = new Logger(CRMCompetitorEquipmentEndpoint.name);

    async createCompetitorEquipment(competitorEquipment: CRMCompetitorEquipmentDto) {
        const raw = await this.execute({
            collection: 'CompetitorEQRootCollection',
            method: 'POST',
            entity: competitorEquipment,
        });

        const result = raw?.d?.results;
        if (!result) {
            return null;
        }

        return result as CRMCompetitorEquipmentDto;
    }

    async getAllCompetitorEquipments() {
        return this.execute({
            collection: 'CompetitorEQRootCollection',
            method: 'GET',
            entity: null,
        });
    }

    /**
     * Note: that id at c4c end is saved as upper-case value.
     * @param query {id, serialNo}
     */
    async getCompetitorEquipmentByQuery(query: { id: string; serialNo: string }): Promise<CRMCompetitorEquipmentDto[]> {
        let filter = '';
        if (query.id && query.serialNo) {
            filter += `$filter=id eq '${query.id.toUpperCase()}' and serialNo eq '${query.serialNo}'`;
        } else if (query.id) {
            filter += `$filter=id eq '${query.id.toUpperCase()}'`;
        } else {
            filter += `$filter=serialNo eq '${query.serialNo}'`;
        }

        const raw = await this.execute({
            collection: `CompetitorEQRootCollection?${filter} &$expand=CompetitorEQAttachment`,
            method: 'GET',
            entity: null,
        });

        const results = raw?.d?.results || [];
        if (results.length < 1) {
            return null;
        }
        this.logger.log(results, `CompetitorEQRootCollection?$expand=CompetitorEQAttachment &${filter}`);
        return results;
    }
}
