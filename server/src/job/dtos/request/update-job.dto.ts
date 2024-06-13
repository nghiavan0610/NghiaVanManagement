import { JobError } from '@/job/enums/job-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateJobDto {
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty({ message: JobError.JOB_NAME_EMPTY })
    name: string;

    @ApiProperty({ type: String })
    @IsOptional()
    description?: string;
}
