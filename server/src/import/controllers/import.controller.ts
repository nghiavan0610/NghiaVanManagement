import { Body, Controller, HttpCode, HttpStatus, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { IImportService } from '../services/import-service.interface';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { ExcelFileValidationPipe } from '@/shared/pipes/excel-file-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes, ApiBody, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ImportSummaryDto } from '../dtos/request/import-summary.dto';

@Controller('import')
export class ImportController {
    constructor(@Inject(IImportService) private readonly importService: IImportService) {}

    // [POST] /import/summary
    @Post('summary')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Summary Import By File.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'file',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async importSummary(
        @UploadedFile(new ExcelFileValidationPipe()) file: Express.Multer.File,
        @GetAuthUser() authDto: AuthDto,
        @Body() importSummaryDto: ImportSummaryDto,
    ): Promise<BooleanResponseDto> {
        importSummaryDto.file = file;
        importSummaryDto.userId = authDto._id;
        const result = await this.importService.importSummary(importSummaryDto);

        return new BooleanResponseDto(result);
    }
}
