import { Provider } from '@nestjs/common';
import { IExportService } from '../services/export-service.interface';
import { ExportService } from '../services/export.service';

export const ExportServiceProvider: Provider = {
    provide: IExportService,
    useClass: ExportService,
};
