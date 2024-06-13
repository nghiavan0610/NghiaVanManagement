import { Provider } from '@nestjs/common';
import { ISummaryService } from '../services/summary-service.interface';
import { SummaryService } from '../services/summary.service';

export const SummaryServiceProvider: Provider = {
    provide: ISummaryService,
    useClass: SummaryService,
};
