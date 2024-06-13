import { IResponse } from '@/shared/interfaces/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CategoryDetailResponseDataDto } from './category-detail-response.dto';

@Expose()
export class CategoryListResponseDto implements IResponse<CategoryDetailResponseDataDto[]> {
    success = true;

    @ApiProperty({ isArray: true, type: CategoryDetailResponseDataDto })
    @Type(() => CategoryDetailResponseDataDto)
    data: CategoryDetailResponseDataDto[];

    constructor(partial: CategoryDetailResponseDataDto[]) {
        this.data = partial;
        // this.data = new CategoryDetailResponseDataDto(partial);
    }
}
