import { ImportSummaryDto } from '../dtos/request/import-summary.dto';

export interface IImportService {
    importSummary(importSummaryDto: ImportSummaryDto): Promise<boolean>;

    // ============================ START COMMON FUNCTION ============================
    // ============================ END COMMON FUNCTION ============================
}

export const IImportService = Symbol('IImportService');
