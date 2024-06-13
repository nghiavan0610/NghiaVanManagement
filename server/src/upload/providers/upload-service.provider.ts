import { Provider } from '@nestjs/common';
import { IUploadService } from '../services/upload-service.interface';
import { UploadService } from '../services/upload.service';

export const UploadServiceProvider: Provider = {
    provide: IUploadService,
    useClass: UploadService,
};
