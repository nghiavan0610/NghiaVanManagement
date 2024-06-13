import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Put, Query } from '@nestjs/common';
import { ISummaryService } from '../services/summary-service.interface';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { CreateSummaryDto } from '../dtos/request/create-summary.dto';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { SummaryDetailResponseDto } from '../dtos/response/summary-detail-response.dto';
import { GetSummaryByProjectDto } from '../dtos/request/get-summary-by-project.dto';
import { UpdateSummaryDto } from '../dtos/request/update-summary.dto';

@Controller('summary')
export class SummaryController {
    constructor(@Inject(ISummaryService) private readonly summaryService: ISummaryService) {}

    // [PUT] /summary
    @Put()
    @ApiOperation({ summary: 'Update Summary Detail.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async updateSummary(
        @GetAuthUser() authDto: AuthDto,
        @Body() updateSummaryDto: UpdateSummaryDto,
    ): Promise<BooleanResponseDto> {
        updateSummaryDto.userId = authDto._id;
        const result = await this.summaryService.updateSummary(updateSummaryDto);

        return new BooleanResponseDto(result);
    }

    // [GET] /summary?projectId=
    @Get()
    @ApiOperation({ summary: 'Get Summary Detail By Id.' })
    @ApiOkResponse({ type: SummaryDetailResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getSummaryDetail(@Query() filters: GetSummaryByProjectDto): Promise<SummaryDetailResponseDto> {
        const result = await this.summaryService.getSummaryDetail(filters);

        return new SummaryDetailResponseDto(result);
    }

    // [POST] /summary
    @Post()
    @ApiOperation({ summary: 'Create Project Summary.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createSummary(
        @GetAuthUser() authDto: AuthDto,
        @Body() createSummaryDto: CreateSummaryDto,
    ): Promise<BooleanResponseDto> {
        createSummaryDto.userId = authDto._id;
        const result = await this.summaryService.createSummary(createSummaryDto);

        return new BooleanResponseDto(result);
    }
}
