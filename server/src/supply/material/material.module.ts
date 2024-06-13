import { Module } from '@nestjs/common';
import { MaterialController } from './controllers/material.controller';
import { MaterialServiceProvider } from './providers/material.provider';
import { IMaterialService } from './services/material-service.interface';
import { Material, MaterialSchema } from './schemas/material.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialRepository } from './repositories/material.repository';
import { MaterialSeeder } from './seeders/material.seeder';

@Module({
    imports: [MongooseModule.forFeature([{ name: Material.name, schema: MaterialSchema }])],
    controllers: [MaterialController],
    providers: [MaterialServiceProvider, MaterialRepository, MaterialSeeder],
    exports: [IMaterialService, MaterialSeeder],
})
export class MaterialModule {}
