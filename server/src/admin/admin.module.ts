import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminServiceProvider } from './providers/admin-service.provider';
import { IAdminService } from './services/admin-service.interface';
import { UserModule } from '@/user/user.module';
import { MemberModule } from '@/project-management/member/member.module';
import { ProjectModule } from '@/project-management/project/project.module';

@Module({
    imports: [UserModule, ProjectModule, MemberModule],
    controllers: [AdminController],
    providers: [AdminServiceProvider],
    exports: [IAdminService],
})
export class AdminModule {}
