import { Module } from '@nestjs/common';
import { ImportController } from './controllers/import.controller';
import { ImportServiceProvider } from './providers/import-service.provider';
import { SummaryModule } from '@/summary/summary.module';
import { CategoryModule } from '@/supply/category/category.module';
import { MaterialModule } from '@/supply/material/material.module';

@Module({
    imports: [SummaryModule, CategoryModule, MaterialModule],
    controllers: [ImportController],
    providers: [ImportServiceProvider],
})
export class ImportModule {}
