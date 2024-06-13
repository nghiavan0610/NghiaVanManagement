import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ACCEPT_EXCEL_TYPE, MAX_SIZE_FILE } from '@/upload/constants';
import { UploadError } from '@/upload/enums/upload-error.enum';

@Injectable()
export class ExcelFileValidationPipe implements PipeTransform {
    async transform(value: any) {
        // "value" is an object containing the file's attributes and metadata

        if (!value) {
            throw new BadRequestException(UploadError.MISSING_IMAGE_FILE);
        }

        if (!ACCEPT_EXCEL_TYPE.includes(value.mimetype)) {
            throw new BadRequestException(UploadError.INVALID_IMAGE_TYPE);
        }

        if (value.size > MAX_SIZE_FILE) {
            throw new BadRequestException(UploadError.FILE_TOO_BIG);
        }

        return value;
    }
}
