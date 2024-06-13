import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { JobDetailResponseDataDto } from './job-detail-response.dto';

@Expose()
export class UpdateJobResponseDto implements IResponse<JobDetailResponseDataDto> {
    success = true;

    @Type(() => JobDetailResponseDataDto)
    data: JobDetailResponseDataDto;

    constructor(partial: JobDetailResponseDataDto) {
        this.data = partial;
        // this.data = new JobDetailResponseDataDto(partial);
    }
}
