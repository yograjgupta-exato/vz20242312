import { IServiceRequest } from '@service-request/interfaces/service-request.interface';
import { JobDto } from '../job.dto';

export class JobDtoFactory {
    static create(sr: IServiceRequest, requestTimeoutSeconds?: number): JobDto {
        if (!sr) {
            return null;
        }
        return new JobDto(sr, requestTimeoutSeconds);
    }

    static createFromList(srList: IServiceRequest[]): JobDto[] {
        if (!srList) {
            return [];
        }
        return srList.map(sr => JobDtoFactory.create(sr));
    }
}
