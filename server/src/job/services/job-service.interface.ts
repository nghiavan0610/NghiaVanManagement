import { FilterQuery } from 'mongoose';
import { CreateJobDto } from '../dtos/request/create-job.dto';
import { JobDetailResponseDataDto } from '../dtos/response/job-detail-response.dto';
import { UpdateJobDto } from '../dtos/request/update-job.dto';
import { Job } from '../schemas/job.schema';

export interface IJobService {
    deleteJob(id: string): Promise<boolean>;
    updateJob(updateJobDto: UpdateJobDto): Promise<boolean>;
    getJobDetail(id: string): Promise<JobDetailResponseDataDto>;
    getJobList(): Promise<JobDetailResponseDataDto[]>;
    createJob(createJobDto: CreateJobDto): Promise<JobDetailResponseDataDto>;

    // ============================ START COMMON FUNCTION ============================
    _getProjectForValidate(filter: FilterQuery<Job>, exceptId?: string): Promise<Job>;
    _getJobById(id: string): Promise<Job>;
    // ============================ END COMMON FUNCTION ============================
}

export const IJobService = Symbol('IJobService');
