import { Inject, Injectable } from '@nestjs/common';
import { IS3Service } from './s3-service.interface';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ILoggerService } from '../../logger/services/logger-service.interface';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PRESIGN_URL_EXPIRE_TIME } from '../constanst';
import { UploadError } from '@/upload/enums/upload-error.enum';

@Injectable()
export class S3Service implements IS3Service {
    constructor(
        @Inject('S3_CLIENT') private readonly s3Client: S3Client,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
    ) {}

    async createPresignedUrl(bucket: string, key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn: PRESIGN_URL_EXPIRE_TIME });
    }

    async putObject(bucket: string, key: string, data: Buffer, contentType: string): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: data,
            ACL: 'public-read',
            ContentDisposition: 'inline',
            ContentType: contentType,
        });

        try {
            await this.s3Client.send(command);
        } catch (err) {
            this.logger.error(UploadError.UPLOAD_FAILED + ' ' + err);
        }
    }

    async delObject(bucket: string, s3LocationUrl: string): Promise<void> {
        const url = new URL(s3LocationUrl).pathname.substring(1);

        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: url,
        });

        try {
            await this.s3Client.send(command);
        } catch (err) {
            this.logger.error(UploadError.DELETE_OBJECT_FAILED + ' ' + err);
        }
    }
}
