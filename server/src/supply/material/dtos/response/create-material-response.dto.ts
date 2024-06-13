import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { MaterialDetailResponseDataDto } from './material-detail-response.dto';

@Expose()
export class CreateMaterialResponseDto implements IResponse<MaterialDetailResponseDataDto> {
    success = true;

    @Type(() => MaterialDetailResponseDataDto)
    data: MaterialDetailResponseDataDto;

    constructor(partial: MaterialDetailResponseDataDto) {
        this.data = partial;
        // this.data = new MaterialDetailResponseDataDto(partial);
    }
}
