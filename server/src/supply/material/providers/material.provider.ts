import { Provider } from '@nestjs/common';
import { IMaterialService } from '../services/material-service.interface';
import { MaterialService } from '../services/material.service';

export const MaterialServiceProvider: Provider = {
    provide: IMaterialService,
    useClass: MaterialService,
};
