import { OmitType } from '@nestjs/swagger';
import { Period } from '@shared/entities/period.entity';

export class PeriodInput extends OmitType(Period, ['timezoneOffset'] as const) {}
