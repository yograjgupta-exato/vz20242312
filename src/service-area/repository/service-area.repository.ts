import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Repository, EntityRepository } from 'typeorm';
import { GeneralStatus } from '@shared/enums';
import { LatLngDto } from '@service-provider/dto/lat-lng.dto';
import { IServiceArea } from '../../service-area/entities/interfaces/service-area.interface';
import { ServiceArea } from '../../service-area/entities/service-area.entity';

@EntityRepository(ServiceArea)
export class ServiceAreaRepository extends Repository<ServiceArea> {
    private readonly logger = new Logger(ServiceAreaRepository.name);

    async findServiceAreasByLatLng(latLng: LatLngDto): Promise<IServiceArea[]> {
        return this.createQueryBuilder('area')
            .where(`ST_Intersects(ST_CollectionExtract(geom, 3), ST_GeometryFromText(\'POINT(${latLng.longitude} ${latLng.latitude})\', srid))`)
            .andWhere('general_status = :status', { status: GeneralStatus.ACTIVE })
            .getMany();
    }

    async findServiceAreaByPostalCode(postalCode: string): Promise<IServiceArea[]> {
        try {
            const rawResult = await this.query(`
            SELECT DISTINCT ON (id) s.*, p.matched_postal_code_range 
            FROM service_areas s
            CROSS JOIN LATERAL json_array_elements ( postal_code_ranges::json ) WITH ORDINALITY AS p(matched_postal_code_range,id)
            WHERE 
                general_status = 'ACTIVE' AND
                (p.matched_postal_code_range->>'minPostalCode')::NUMERIC <= ${postalCode} AND 
                (p.matched_postal_code_range->>'maxPostalCode')::NUMERIC >= ${postalCode}`);

            return plainToClass(ServiceArea, rawResult as object[]);
        } catch (ex) {
            this.logger.warn(ex);
            return [];
        }
    }
}
