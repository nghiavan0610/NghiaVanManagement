import { HealthResponseDataDto } from '../dtos/health-response-data.dto';

export interface IHealthService {
    healthCheck(): Promise<HealthResponseDataDto>;
}

export const IHealthService = Symbol('IHealthService');
