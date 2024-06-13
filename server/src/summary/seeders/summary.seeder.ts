import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { SummaryRepository } from '../repositories/summary.repository';
import { PillarCategoryRepository } from '../repositories/pillar-category.repository';
import { PillarGroupRepository } from '../repositories/pillar-group.repository';
import { PillarMaterialRepository } from '../repositories/pillar-material.repository';
import { PillarRepository } from '../repositories/pillar.repository';
import { RouteRepository } from '../repositories/route.repository';
import { StationRepository } from '../repositories/station.repository';

@Injectable()
export class SummarySeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly summaryRepository: SummaryRepository,
        private readonly routeRepository: RouteRepository,
        private readonly stationRepository: StationRepository,
        private readonly pillarRepository: PillarRepository,
        private readonly pillarGroupRepository: PillarGroupRepository,
        private readonly pillarCategoryRepository: PillarCategoryRepository,
        private readonly pillarMaterialRepository: PillarMaterialRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[SUMMARY SEEDING UP]');

        // const processedSummarys = categories.map((summary: any) => {
        //     const processField = (key: string, value: any) => {
        //         if (value?.$oid) {
        //             return value.$oid;
        //         }
        //         if (Array.isArray(value)) {
        //             return value.map((item: any) => processField('', item));
        //         }
        //         if (value?.$date) {
        //             return new Date(value.$date);
        //         }
        //         return value;
        //     };

        //     const processedSummary: any = { ...summary };
        //     Object.keys(processedSummary).forEach((key) => {
        //         processedSummary[key] = processField(key, processedSummary[key]);
        //     });
        //     return processedSummary;
        // });

        // await this.summaryRepository.insertMany(processedSummarys);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[SUMMARY SEEDING DOWN]');

        await this.summaryRepository.collectionDrop();
        await this.routeRepository.collectionDrop();
        await this.stationRepository.collectionDrop();
        await this.pillarRepository.collectionDrop();
        await this.pillarGroupRepository.collectionDrop();
        await this.pillarCategoryRepository.collectionDrop();
        await this.pillarMaterialRepository.collectionDrop();
    }
}
