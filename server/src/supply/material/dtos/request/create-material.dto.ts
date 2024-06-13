import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { MaterialError } from '@/supply/material/enums/material-error.enum';
import { CategoryError } from '@/supply/category/enums/category-error.enum';

export class CreateMaterialDto {
    @ApiProperty()
    @IsNotEmpty({ message: MaterialError.MATERIAL_NAME_EMPTY })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: CategoryError.CATEGORY_ID_EMPTY })
    categoryId: string;
}
