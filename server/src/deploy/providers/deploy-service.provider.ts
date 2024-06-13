import { Provider } from '@nestjs/common';
import { IDeployService } from '../services/deploy-service.interface';
import { DeployService } from '../services/deploy.service';

export const DeployServiceProvider: Provider = {
    provide: IDeployService,
    useClass: DeployService,
};
