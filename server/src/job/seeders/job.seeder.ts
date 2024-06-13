import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { jobs } from 'db/devData';
import { JobRepository } from '../repositories/job.repository';

@Injectable()
export class JobSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly jobRepository: JobRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[JOB SEEDING UP]');

        const processedJobs = jobs.map((job: any) => {
            const processField = (key: string, value: any) => {
                if (value?.$oid) {
                    return value.$oid;
                }
                if (Array.isArray(value)) {
                    return value.map((item: any) => processField('', item));
                }
                if (value?.$date) {
                    return new Date(value.$date);
                }
                return value;
            };

            const processedJob: any = { ...job };
            Object.keys(processedJob).forEach((key) => {
                processedJob[key] = processField(key, processedJob[key]);
            });
            return processedJob;
        });

        await this.jobRepository.insertMany(processedJobs);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[JOB SEEDING DOWN]');

        await this.jobRepository.collectionDrop();
    }
}
