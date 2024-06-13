import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MaterialDetailResponseDataDto } from './material-detail-response.dto';

@Expose()
export class MaterialListResponseDto implements IResponse<MaterialDetailResponseDataDto[]> {
    success = true;

    @ApiProperty({ isArray: true, type: MaterialDetailResponseDataDto })
    @Type(() => MaterialDetailResponseDataDto)
    data: MaterialDetailResponseDataDto[];

    constructor(partial: MaterialDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new MaterialDetailResponseDataDto(partial);
    }
}
