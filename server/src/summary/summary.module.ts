import { Module, forwardRef } from '@nestjs/common';
import { SummaryController } from './controllers/summary.controller';
import { SummaryServiceProvider } from './providers/summary-service.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Pillar, PillarSchema } from './schemas/pillar.schema';
import { Route, RouteSchema } from './schemas/route.schema';
import { Station, StationSchema } from './schemas/station.schema';
import { Summary, SummarySchema } from './schemas/summary.schema';
import { SummaryRepository } from './repositories/summary.repository';
import { RouteRepository } from './repositories/route.repository';
import { StationRepository } from './repositories/station.repository';
import { PillarRepository } from './repositories/pillar.repository';
import { ProjectModule } from '@/project-management/project/project.module';
import { PillarGroup, PillarGroupSchema } from './schemas/pillar-group.schema';
import { PillarGroupRepository } from './repositories/pillar-group.repository';
import { PillarCategory, PillarCategorySchema } from './schemas/pillar-category.schema';
import { PillarCategoryRepository } from './repositories/pillar-category.repository';
import { PillarMaterial, PillarMaterialSchema } from './schemas/pillar-material.schema';
import { PillarMaterialRepository } from './repositories/pillar-material.repository';
import { SummarySeeder } from './seeders/summary.seeder';
import { ISummaryService } from './services/summary-service.interface';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Summary.name, schema: SummarySchema },
            { name: Route.name, schema: RouteSchema },
            { name: Station.name, schema: StationSchema },
            { name: Pillar.name, schema: PillarSchema },
            { name: PillarGroup.name, schema: PillarGroupSchema },
            { name: PillarCategory.name, schema: PillarCategorySchema },
            { name: PillarMaterial.name, schema: PillarMaterialSchema },
        ]),
        forwardRef(() => ProjectModule),
    ],
    controllers: [SummaryController],
    providers: [
        SummaryServiceProvider,
        SummaryRepository,
        RouteRepository,
        StationRepository,
        PillarRepository,
        PillarGroupRepository,
        PillarCategoryRepository,
        PillarMaterialRepository,
        SummarySeeder,
    ],
    exports: [ISummaryService, SummarySeeder],
})
export class SummaryModule {}
