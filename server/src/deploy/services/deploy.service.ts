import { Injectable } from '@nestjs/common';
import { IDeployService } from './deploy-service.interface';

@Injectable()
export class DeployService implements IDeployService {}
