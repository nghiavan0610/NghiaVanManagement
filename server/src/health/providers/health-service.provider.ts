import { Provider } from '@nestjs/common';
import { IHealthService } from '../services/health-service.interface';
import { HealthService } from '../services/health.service';

export const HealthServiceProvider: Provider = {
    provide: IHealthService,
    useClass: HealthService,
};
