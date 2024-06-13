import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IJobService } from './job-service.interface';
import { CreateJobDto } from '../dtos/request/create-job.dto';
import { JobRepository } from '../repositories/job.repository';
import { JobDetailResponseDataDto } from '../dtos/response/job-detail-response.dto';
import { Job } from '../schemas/job.schema';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { UpdateJobDto } from '../dtos/request/update-job.dto';
import { JobError } from '../enums/job-error.enum';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { IUserService } from '@/user/services/user-service.interface';
import { FilterQuery } from 'mongoose';
import { CommonError } from '@/shared/enums/common-error.enum';

@Injectable()
export class JobService implements IJobService {
    constructor(
        private readonly jobRepository: JobRepository,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(IUserService) private readonly userService: IUserService,
    ) {}

    // [DELTE] /jobs/:id
    async deleteJob(id: string): Promise<boolean> {
        this.logger.info('[DELETE JOB] id', id);

        const job = await this._getJobById(id);
        if (!job) {
            throw new CustomException({
                message: JobError.JOB_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Remove job from relation Users
        await this.userService._removeJob(job._id.toString());

        const deleted = await this.jobRepository.deleteOne({ _id: id });

        return deleted.deletedCount === 1 ? true : false;
    }

    // [PUT] /jobs/:id
    async updateJob(updateJobDto: UpdateJobDto): Promise<boolean> {
        this.logger.info('[UPDATE JOB] updateJobDto', updateJobDto);

        const { id, ...restDto } = updateJobDto;

        const job = await this._getJobById(id);
        if (!job) {
            throw new CustomException({
                message: JobError.JOB_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check existed attribute
        const checkName = await this._getProjectForValidate({ name: updateJobDto.name }, id);
        if (checkName) {
            throw new CustomException({
                message: JobError.JOB_NAME_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        const result = await this.jobRepository.updateOne({ _id: id }, restDto);
        if (result.modifiedCount !== 1) {
            throw new CustomException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: CommonError.SOMETHING_WRONG_WHEN_UPDATE,
            });
        }

        return true;
    }

    // [GET] /jobs/:id
    async getJobDetail(id: string): Promise<JobDetailResponseDataDto> {
        this.logger.info('[GET JOB DETAIL BY ID] id', id);

        const job = await this._getJobById(id);
        if (!job) {
            throw new CustomException({
                message: JobError.JOB_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        return job;
    }

    // [GET] /jobs
    async getJobList(): Promise<JobDetailResponseDataDto[]> {
        this.logger.info('[GET JOB LIST]');

        return this.jobRepository.findAll();
    }

    // [POST] /jobs/create-job
    async createJob(createJobDto: CreateJobDto): Promise<JobDetailResponseDataDto> {
        this.logger.info('[CREATE JOB], createJobDto', createJobDto);

        return this.jobRepository.create(createJobDto);
    }

    // ============================ START COMMON FUNCTION ============================
    async _getProjectForValidate(filter: FilterQuery<Job>, exceptId?: string): Promise<Job> {
        const query = exceptId ? { _id: { $ne: exceptId }, ...filter } : { ...filter };

        return this.jobRepository.findOne(query);
    }

    async _getJobById(id: string): Promise<Job> {
        return this.jobRepository.findById(id);
    }
    // ============================ END COMMON FUNCTION ============================
}
