import { Controller, Inject } from '@nestjs/common';
import { IDeployService } from '../services/deploy-service.interface';

@Controller('deploy')
export class DeployController {
    constructor(@Inject(IDeployService) private readonly deployService: IDeployService) {}
}
