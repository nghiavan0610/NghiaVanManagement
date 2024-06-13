import { UploadFilesDto } from '../dtos/request/upload-files.dto';

export interface IUploadService {
    uploadFiles(uploadFilesDto: UploadFilesDto): Promise<string[]>;
}

export const IUploadService = Symbol('IUploadService');
