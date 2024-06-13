import { StringHelper } from '@/shared/helpers/string.helper';
import { UploadError } from '@/upload/enums/upload-error.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUtil {
    constructor(private readonly configService: ConfigService) {}

    getUploadedPath(keyObject: string): string {
        return `${this.configService.get('aws.s3.endpoint')}/${keyObject}`;
    }

    getFileNameAndExtention(fileName: string): { name: string; ext: string } {
        if (!fileName.includes('.')) {
            throw new BadRequestException(UploadError.INVALID_FILE_UPLOAD);
        }

        const name = fileName.slice(
            fileName.lastIndexOf('/') === -1 ? 0 : fileName.lastIndexOf('/') + 1,
            fileName.lastIndexOf('.'),
        );
        const ext = fileName.slice(fileName.lastIndexOf('.') + 1);

        return {
            name,
            ext,
        };
    }

    initDefaultFileName(): string {
        const randomStr = StringHelper.generateRandomString(10);

        return `${randomStr}${Date.now()}`;
    }

    getObjectPathFromPresignUrl(presignUrl: string): string {
        const urlRemovedQueries = presignUrl.split('?').shift();
        const domain = `${this.configService.get('aws.s3.endpoint')}/${this.configService.get('aws.s3.bucket')}/`;
        return urlRemovedQueries.replace(domain, '');
    }
}
