import { Provider } from '@nestjs/common';
import { IJobService } from '../services/job-service.interface';
import { JobService } from '../services/job.service';

export const JobServiceProvider: Provider = {
    provide: IJobService,
    useClass: JobService,
};
