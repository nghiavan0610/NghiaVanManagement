import { SummaryError } from '@/summary/enums/summary-error.enum';
import { PillarGroupType } from '@/summary/schemas/pillar-group.schema';
import { Category } from '@/supply/category/schemas/category.schema';
import { Material } from '@/supply/material/schemas/material.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum } from 'class-validator';

export class ReportRouteDataDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.ROUTE_NAME_EMPTY })
    name: string;

    stations: ReportStationDto[];
}

export class ReportStationDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.STATION_NAME_EMPTY })
    name: string;

    pillars: ReportPillarDto[];
}

export class ReportPillarDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.PILLAR_NAME_EMPTY })
    name: string;

    distance?: number;
    completionDistance?: number;
    completion?: string;
    neoDistance?: number;
    shape?: string;
    middleLine?: number;
    lowLine?: number;
    description?: string;

    groups: ReportPillarGroupDto[];
}

export class ReportPillarGroupDto {
    @ApiProperty()
    @IsEnum(PillarGroupType)
    type: PillarGroupType;

    categories: ReportPillarCategoryDto[];
}

export class ReportPillarCategoryDto {
    // @ApiProperty()
    // @IsNotEmpty({ message: CategoryError.CATEGORY_ID_EMPTY })
    category: Category;

    materials: ReportPillarMaterialDto[];
}

export class ReportPillarMaterialDto {
    // @ApiProperty()
    // @IsNotEmpty({ message: MaterialError.MATERIAL_ID_EMPTY })
    material: Material;

    quantity?: number;
    originalQuantity?: number;
    comment?: string;

    export?: boolean;
}
