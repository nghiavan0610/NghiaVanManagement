import { Module } from '@nestjs/common';
import { DeployServiceProvider } from './providers/deploy-service.provider';
import { DeployController } from './controllers/deploy.controller';

@Module({
    controllers: [DeployController],
    providers: [DeployServiceProvider],
})
export class DeployModule {}
