import { User } from '@shared/entities/user';
import { TechnicalNoteDto } from '@service-request/dto/technical-note.dto';
import { RequestedServicePackage } from '@service-request/entities/requested-service-package.entity';
import { ServiceRequest } from '@service-request/entities/service-request.entity';
import { TechnicalReport } from '@service-request/entities/technical-report.entity';
import { Payout } from '@payout/entities/payout.entity';
import { Dealer } from '../../dealer/dealer.entity';
import { ServicePackage } from '../../service-package/entities/service-package.entity';
import { ServiceProvider } from '../../service-provider/service-provider.entity';
/**
 * A map of all the core database entities.
 */
export const CoreEntitiesMap = {
    User,
    Dealer,
    ServiceRequest,
    ServicePackage,
    ServiceProvider,
    RequestedServicePackage,
    TechnicalReport,
    TechnicalNoteDto,
    Payout,
};
