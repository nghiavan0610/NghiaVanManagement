// import { ProjectError } from '@/project/enums/project-error.enum';
import { SummaryError } from '@/summary/enums/summary-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PillarGroupType } from '@/summary/schemas/pillar-group.schema';
import { CategoryError } from '@/supply/category/enums/category-error.enum';
import { MaterialError } from '@/supply/material/enums/material-error.enum';
import { ProjectError } from '@/project-management/project/enums/project-error.enum';

export class UpdateSummaryDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProjectError.PROJECT_ID_EMPTY })
    projectId: string;

    routes: UpdateRouteDto[];
}

export class UpdateRouteDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.ROUTE_NAME_EMPTY })
    name: string;

    position: number;

    stations: UpdateStationDto[];
}

export class UpdateStationDto {
    @ApiProperty()
    @IsNotEmpty({ message: SummaryError.STATION_NAME_EMPTY })
    name: string;

    position: number;

    pillars: UpdatePillarDto[];
}

export class UpdatePillarDto {
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

    groups: UpdatePillarGroupDto[];
}

export class UpdatePillarGroupDto {
    @ApiProperty()
    @IsEnum(PillarGroupType)
    type: PillarGroupType;

    position: number;

    categories: UpdatePillarCategoryDto[];
}

export class UpdatePillarCategoryDto {
    @ApiProperty()
    @IsNotEmpty({ message: CategoryError.CATEGORY_ID_EMPTY })
    categoryId: string;

    position: number;

    materials: UpdatePillarMaterialDto[];
}

export class UpdatePillarMaterialDto {
    @ApiProperty()
    @IsNotEmpty({ message: MaterialError.MATERIAL_ID_EMPTY })
    materialId: string;

    quantity?: number;
    comment?: string;
    isDone?: boolean;

    position: number;
}
