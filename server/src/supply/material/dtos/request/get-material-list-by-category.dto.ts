import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetMaterialListByCategoryDto {
    @ApiPropertyOptional()
    @Transform((params) => (params.value === '' ? null : params.value))
    @IsOptional()
    categoryId: string;
}
