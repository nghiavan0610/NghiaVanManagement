import { CreateRouteDto, CreateSummaryDto } from '../dtos/request/create-summary.dto';
import { GetSummaryByProjectDto } from '../dtos/request/get-summary-by-project.dto';
import { UpdateSummaryDto } from '../dtos/request/update-summary.dto';
import { SummaryDetailResponseDataDto } from '../dtos/response/summary-detail-response.dto';
import { Route } from '../schemas/route.schema';
import { Summary } from '../schemas/summary.schema';

export interface ISummaryService {
    updateSummary(updateSummaryDto: UpdateSummaryDto): Promise<boolean>;
    getSummaryDetail(filters: GetSummaryByProjectDto): Promise<SummaryDetailResponseDataDto[]>;
    createSummary(createSummaryDto: CreateSummaryDto): Promise<boolean>;
    // ============================ START COMMON FUNCTION ============================
    _validateSummaryToUpdate(projectId: string, userId: string): Promise<boolean>;
    _validateSummaryToCreate(projectId: string, userId: string): Promise<boolean>;
    _createNestedSummary(routes: CreateRouteDto[]): Promise<Route[]>;
    _createSummary(doc: Summary | any): Promise<Summary>;
    _getSummaryByOriginal(projectId: string, isOriginal: boolean): Promise<Summary>;
    // ============================ END COMMON FUNCTION ============================
}

export const ISummaryService = Symbol('ISummaryService');
