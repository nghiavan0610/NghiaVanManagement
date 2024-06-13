import { Module, forwardRef } from '@nestjs/common';
import { ProjectController } from './controllers/project.controller';
import { ProjectServiceProvider } from './providers/project.provider';
import { IProjectService } from './services/project-service.interface';
import { ProjectRepository } from './repositories/project.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { IsUniqueProjectName } from './validators/project-name.validator';
import { IsUniqueProjectCode } from './validators/project-code.validator';
import { UserModule } from '@/user/user.module';
import { ProjectSeeder } from './seeders/project.seeder';
import { MemberModule } from '@/project-management/member/member.module';
import { SummaryModule } from '@/summary/summary.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
        UserModule,
        MemberModule,
        forwardRef(() => SummaryModule),
    ],
    controllers: [ProjectController],
    providers: [ProjectServiceProvider, ProjectRepository, IsUniqueProjectName, IsUniqueProjectCode, ProjectSeeder],
    exports: [IProjectService, ProjectSeeder],
})
export class ProjectModule {}
