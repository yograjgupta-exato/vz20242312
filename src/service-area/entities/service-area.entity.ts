import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '@shared/entities/abstract.entity';
import { GeneralStatus } from '@shared/enums';
import { ServiceAreaType } from '@shared/enums/service-area-type';
import { IServiceArea } from './interfaces/service-area.interface';
import { PostalCodeRange } from './postal-code-range.entity';
const SRID = 4326;

@Entity({ name: 'service_areas' })
export class ServiceArea extends AbstractEntity implements IServiceArea {
    @Column({
        default: false,
    })
    isWithinCoverage: boolean;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'GeometryCollection',
        srid: SRID,
        nullable: true,
    })
    @Exclude()
    @ApiHideProperty()
    geom?: object;

    @Column({
        type: 'jsonb',
        nullable: true,
    })
    postalCodeRanges?: PostalCodeRange[];

    @Column({ unique: true })
    name: string;

    @Column({
        name: 'general_status',
        type: 'enum',
        enum: GeneralStatus,
        default: GeneralStatus.ACTIVE,
    })
    status: GeneralStatus;

    @Column({
        default: SRID,
    })
    srid: number;

    @Column({
        default: ServiceAreaType.Polygon,
        enum: ServiceAreaType,
        type: 'enum',
    })
    type: ServiceAreaType;

    @Column({
        default: false,
    })
    isInternal: boolean;

    public isNowWithinCoverage(): boolean {
        return this.isWithinCoverage;
    }

    public getId(): string {
        return this.id;
    }
}
