import { Provider } from '@nestjs/common';
import { IImportService } from '../services/import-service.interface';
import { ImportService } from '../services/import.service';

export const ImportServiceProvider: Provider = {
    provide: IImportService,
    useClass: ImportService,
};
