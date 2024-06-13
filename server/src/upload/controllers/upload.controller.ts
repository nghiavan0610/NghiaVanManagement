import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiBody, ApiConsumes, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { IUploadService } from '../services/upload-service.interface';
import { FilesValidationPipe } from '@/shared/pipes/files-validation.pipe';
import { UploadImageResponseDto } from '../dtos/response/upload-image-response.dto';
import { UploadFilesDto } from '../dtos/request/upload-files.dto';

@Controller('uploads')
export class UploadController {
    constructor(@Inject(IUploadService) private readonly uploadService: IUploadService) {}

    // [POST] /uploads
    @Post()
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiOperation({ summary: 'Upload Files.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'file',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiOkResponse({ type: UploadImageResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async uploadFiles(
        @UploadedFiles(new FilesValidationPipe()) files: Array<Express.Multer.File>,
        @Body() uploadFilesDto: UploadFilesDto,
    ): Promise<UploadImageResponseDto> {
        uploadFilesDto.files = files;
        const result = await this.uploadService.uploadFiles(uploadFilesDto);

        return new UploadImageResponseDto(result);
    }
}
