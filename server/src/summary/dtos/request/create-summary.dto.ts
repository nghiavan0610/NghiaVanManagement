import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { SummaryError } from '@/summary/enums/summary-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PillarGroupType } from '@/summary/schemas/pillar-group.schema';
import { CategoryError } from '@/supply/category/enums/category-error.enum';
import { MaterialError } from '@/supply/material/enums/material-error.enum';

export class CreateSummaryDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    routes: CreateRouteDto[];
}

export class CreateRouteDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.ROUTE_NAME_EMPTY })
    name: string;

    position: number;

    stations: CreateStationDto[];
}

export class CreateStationDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.STATION_NAME_EMPTY })
    name: string;

    position: number;

    pillars: CreatePillarDto[];
}

export class CreatePillarDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.PILLAR_NAME_EMPTY })
    name: string;

    position: number;

    distance?: number;
    completionDistance?: number;
    completion?: string;
    neoDistance?: number;
    shape?: string;
    middleLine?: number;
    lowLine?: number;
    description?: string;

    groups: CreatePillarGroupDto[];
}

export class CreatePillarGroupDto {
    @ApiProperty()
    @IsEnum(PillarGroupType)
    type: PillarGroupType;

    position: number;

    categories: CreatePillarCategoryDto[];
}

export class CreatePillarCategoryDto {
    @ApiProperty()
    @IsNotEmpty({ message: CategoryError.CATEGORY_ID_EMPTY })
    categoryId: string;

    position: number;

    materials: CreatePillarMaterialDto[];
}

export class CreatePillarMaterialDto {
    @ApiProperty()
    @IsNotEmpty({ message: MaterialError.MATERIAL_ID_EMPTY })
    materialId: string;

    quantity?: number;
    comment?: boolean;
    isDone?: boolean;

    position: number;
}
