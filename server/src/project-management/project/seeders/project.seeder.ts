import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { projects } from 'db/devData';
import { ProjectRepository } from '../repositories/project.repository';

@Injectable()
export class ProjectSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly projectRepository: ProjectRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[PROJECT SEEDING UP]');

        const processedProjects = projects.map((project: any) => {
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

            const processedProject: any = { ...project };
            Object.keys(processedProject).forEach((key) => {
                processedProject[key] = processField(key, processedProject[key]);
            });
            return processedProject;
        });

        await this.projectRepository.insertMany(processedProjects);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[PROJECT SEEDING DOWN]');

        await this.projectRepository.collectionDrop();
    }
}
