import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CategoryError } from '../../enums/category-error.enum';
import { UniqueCategoryName } from '../../validators/category-name.validator';
import { Transform } from 'class-transformer';
import * as _ from 'lodash';

export class CreateCategoryDto {
    @ApiProperty()
    @IsNotEmpty({ message: CategoryError.CATEGORY_NAME_EMPTY })
    @Transform(({ value }) => _.trim(value))
    @UniqueCategoryName({ message: CategoryError.CATEGORY_NAME_EXISTED })
    name: string;
}
