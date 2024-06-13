import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { CategoryDetailResponseDataDto } from './category-detail-response.dto';

@Expose()
export class CreateCategoryResponseDto implements IResponse<CategoryDetailResponseDataDto> {
    success = true;

    @Type(() => CategoryDetailResponseDataDto)
    data: CategoryDetailResponseDataDto;

    constructor(partial: CategoryDetailResponseDataDto) {
        this.data = partial;
        // this.data = new CategoryDetailResponseDataDto(partial);
    }
}
