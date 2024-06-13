import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ACCEPT_IMAGE_TYPES, MAX_SIZE_FILE } from '@/upload/constants';
import { UploadError } from '@/upload/enums/upload-error.enum';

@Injectable()
export class FilesValidationPipe implements PipeTransform {
    async transform(value: any) {
        // "value" is an object containing the file's attributes and metadata

        await Promise.all(
            value.map(async (file: any) => {
                if (file.length === 0) {
                    throw new BadRequestException(UploadError.MISSING_IMAGE_FILE);
                }

                if (!ACCEPT_IMAGE_TYPES.includes(file.mimetype)) {
                    throw new BadRequestException(UploadError.INVALID_IMAGE_TYPE);
                }

                if (file.size > MAX_SIZE_FILE) {
                    throw new BadRequestException(UploadError.FILE_TOO_BIG);
                }

                return file;
            }),
        );

        return value;
    }
}
