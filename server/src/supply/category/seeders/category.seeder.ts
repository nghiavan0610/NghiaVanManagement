import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { categories } from 'db/devData';

@Injectable()
export class CategorySeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[CATEGORY SEEDING UP]');

        const processedCategorys = categories.map((category: any) => {
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

            const processedCategory: any = { ...category };
            Object.keys(processedCategory).forEach((key) => {
                processedCategory[key] = processField(key, processedCategory[key]);
            });
            return processedCategory;
        });

        await this.categoryRepository.insertMany(processedCategorys);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[CATEGORY SEEDING DOWN]');

        await this.categoryRepository.collectionDrop();
    }
}
