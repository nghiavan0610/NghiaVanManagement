import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { HealthResponseDataDto } from './health-response-data.dto';

@Expose()
export class HealthResponseDto implements IResponse<HealthResponseDataDto> {
    success = true;

    @Type(() => HealthResponseDataDto)
    data: HealthResponseDataDto;

    constructor(partial: Partial<HealthResponseDataDto>) {
        this.data = new HealthResponseDataDto(partial);
    }
}
