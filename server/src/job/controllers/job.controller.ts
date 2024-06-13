import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { IJobService } from '../services/job-service.interface';
import { CreateJobDto } from '../dtos/request/create-job.dto';
import { CreateJobResponseDto } from '../dtos/response/create-job-response.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { JobDetailResponseDto } from '../dtos/response/job-detail-response.dto';
import { JobListResponseDto } from '../dtos/response/job-list-response.dto';
import { UpdateJobDto } from '../dtos/request/update-job.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { Roles } from '@/shared/decorators/role.decorator';
import { RolesGuard } from '@/shared/guards/role.guard';

@Controller('jobs')
export class JobController {
    constructor(@Inject(IJobService) private readonly jobService: IJobService) {}

    // [DELETE] /jobs/:id
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delte Job.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async deleteJob(@Param('id') id: string): Promise<BooleanResponseDto> {
        const result = await this.jobService.deleteJob(id);

        return new BooleanResponseDto(result);
    }

    // [PUT] /jobs/:id
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update Job.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async updateJob(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto): Promise<BooleanResponseDto> {
        updateJobDto.id = id;
        const result = await this.jobService.updateJob(updateJobDto);

        return new BooleanResponseDto(result);
    }

    // [GET] /jobs/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get Job Detail By Id.' })
    @ApiOkResponse({ type: JobDetailResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getJobDetail(@Param('id') id: string): Promise<JobDetailResponseDto> {
        const result = await this.jobService.getJobDetail(id);

        return new JobDetailResponseDto(result);
    }

    // [GET] /jobs
    @Get()
    @ApiOperation({ summary: 'Get Job List.' })
    @ApiOkResponse({ type: JobListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getJobList(): Promise<JobListResponseDto> {
        const result = await this.jobService.getJobList();

        return new JobListResponseDto(result);
    }

    // [POST] /jobs
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Post()
    @ApiOperation({ summary: 'Create Job.' })
    @ApiOkResponse({ type: CreateJobResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createJob(@Body() createJobDto: CreateJobDto): Promise<CreateJobResponseDto> {
        const result = await this.jobService.createJob(createJobDto);

        return new CreateJobResponseDto(result);
    }
}
