import { JobError } from '@/job/enums/job-error.enum';
import { UniqueJobName } from '@/job/validators/job-name.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateJobDto {
    @ApiProperty({ type: String })
    @IsNotEmpty({ message: JobError.JOB_NAME_EMPTY })
    @UniqueJobName({ message: JobError.JOB_EXISTED })
    name: string;

    @ApiProperty({ type: String })
    @IsOptional()
    description?: string;
}
