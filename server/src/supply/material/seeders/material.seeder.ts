import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { materials } from 'db/devData';
import { MaterialRepository } from '../repositories/material.repository';

@Injectable()
export class MaterialSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly materialRepository: MaterialRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[MATERIAL SEEDING UP]');

        const processedMaterials = materials.map((material: any) => {
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

            const processedMaterial: any = { ...material };
            Object.keys(processedMaterial).forEach((key) => {
                processedMaterial[key] = processField(key, processedMaterial[key]);
            });
            return processedMaterial;
        });

        await this.materialRepository.insertMany(processedMaterials);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[MATERIAL SEEDING DOWN]');

        await this.materialRepository.collectionDrop();
    }
}
