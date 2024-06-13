import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { IS3Service } from '@/shared/modules/s3/services/s3-service.interface';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadError } from '../enums/upload-error.enum';
import { IUploadService } from './upload-service.interface';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { UploadFilesDto } from '../dtos/request/upload-files.dto';
import mime from 'mime-types';
import { FileType } from '../enums/file-type.enum';
import { IProjectService } from '@/project-management/project/services/project-service.interface';
import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { PROOF_NAME_START_WITH } from '@/project-management/proof/constants/proof.constant';

@Injectable()
export class UploadService implements IUploadService {
    constructor(
        private readonly configService: ConfigService,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(IS3Service) private readonly s3Service: IS3Service,
        @Inject(IProjectService) private readonly projectService: IProjectService,
    ) {}

    // [POST] /upload
    async uploadFiles(uploadFilesDto: UploadFilesDto): Promise<string[]> {
        const { files, ...restDto } = uploadFilesDto;
        this.logger.info('[UPLOAD FILES] uploadFilesDto', restDto);

        // Requirement: Only approve file has starts with 'BBTN' for type 'proofs'
        for (const file of files) {
            if (restDto.type === FileType.PROOFS && !file.originalname.startsWith(PROOF_NAME_START_WITH)) {
                this.logger.error('[INVALID PROOF NAME] file.originalname', file.originalname);
                throw new CustomException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: UploadError.INVALID_PROOF_FILE_NAME,
                });
            }
        }

        const project = await this.projectService._findByIdProject(restDto.projectId);
        if (!project) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Put object to S3
        const keyObjects = await Promise.all(
            files.map(async (file) => {
                this.logger.info('[UPLOAD FILES] file.originalname', file.originalname);

                const keyObject = `${restDto.type}/${restDto.projectId}/${file.originalname}`;
                const bucket = this.configService.getOrThrow('aws.s3.bucket');

                // Determine content type
                const contentType = mime.lookup(file.originalname) || 'application/octet-stream';

                try {
                    await this.s3Service.putObject(bucket, keyObject, Buffer.from(file.buffer), contentType);

                    return keyObject;
                } catch (err) {
                    throw new CustomException({
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        message: UploadError.UPLOAD_FAILED,
                    });
                }
            }),
        );

        return keyObjects;
    }
}
