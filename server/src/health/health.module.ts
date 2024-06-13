import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { HealthServiceProvider } from './providers/health-service.provider';

@Module({
    controllers: [HealthController],
    providers: [HealthServiceProvider],
})
export class HealthModule {}
