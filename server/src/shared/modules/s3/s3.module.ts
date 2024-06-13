import { Global, Module } from '@nestjs/common';
import { S3ServiceProvider } from './providers/s3-service.provider';
import { S3ClientProvider } from './providers/s3.provider';
import { IS3Service } from './services/s3-service.interface';

@Global()
@Module({
    providers: [S3ServiceProvider, S3ClientProvider],
    exports: [IS3Service],
})
export class S3Module {}
