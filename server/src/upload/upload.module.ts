import { Global, Module } from '@nestjs/common';
import { UploadController } from './controllers/upload.controller';
import { UploadServiceProvider } from './providers/upload-service.provider';
import { IUploadService } from './services/upload-service.interface';
import { ProjectModule } from '@/project-management/project/project.module';

@Global()
@Module({
    imports: [ProjectModule],
    controllers: [UploadController],
    providers: [UploadServiceProvider],
    exports: [IUploadService],
})
export class UploadModule {}
