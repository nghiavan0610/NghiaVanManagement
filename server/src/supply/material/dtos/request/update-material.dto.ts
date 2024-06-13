import { MaterialError } from '@/supply/material/enums/material-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateMaterialDto {
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty({ message: MaterialError.MATERIAL_NAME_EMPTY })
    name: string;
}
