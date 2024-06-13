import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { JobDetailResponseDataDto } from './job-detail-response.dto';

@Expose()
export class JobListResponseDto implements IResponse<JobDetailResponseDataDto[]> {
    success = true;

    @ApiProperty({ isArray: true, type: JobDetailResponseDataDto })
    @Type(() => JobDetailResponseDataDto)
    data: JobDetailResponseDataDto[];

    constructor(partial: JobDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new JobDetailResponseDataDto(partial);
    }
}
