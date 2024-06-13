export class ExportReportDataDto {
    totalQuantity: number;
    totalOriginalQuantity: number;

    routes: ExportReportRouteDataDto[];
}

export class ExportReportRouteDataDto {
    routeName: string;

    routeQuantity: number;
    routeOriginalQuantity: number;

    routeDistance: number;

    stations: ExportReportStationDto[];
}

export class ExportReportStationDto {
    stationName: string;

    // BM_KeoDay, BM_Tram, BM_ThuHoi, BM_LapDatPD
    groups?: ExportReportGroupDto[];

    // BM_Tru, BM_Mong, BM_Neo, BM_TiepDia
    pillars?: ExportReportPillarDto[];
}

export class ExportReportGroupDto {
    groupMaterial: string;

    groupPillar: string[];
    firstPillar: string;
    lastPillar: string;

    groupDistance: number;

    groupQuantity: number;
    groupOriginalQuantity: number;
    groupComment: string[];
}

export class ExportReportPillarDto {
    pillarName: string;

    materials: ExportReportPillarMaterialDto[];
}

export class ExportReportPillarMaterialDto {
    materialName: string;
    materialQuantity: number;
    materialOriginalQuantity: number;
    materialComment?: string;
}
