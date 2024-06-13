import { Provider } from '@nestjs/common';
import { IS3Service } from '../services/s3-service.interface';
import { S3Service } from '../services/s3.service';

export const S3ServiceProvider: Provider = {
    provide: IS3Service,
    useClass: S3Service,
};
