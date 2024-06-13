import { Injectable } from '@nestjs/common';
import * as FsExtra from 'fs-extra';
import * as Path from 'path';
import { IHealthService } from './health-service.interface';
import { HealthResponseDataDto } from '../dtos/health-response-data.dto';

@Injectable()
export class HealthService implements IHealthService {
    async healthCheck(): Promise<HealthResponseDataDto> {
        const packageJson = await FsExtra.readJSON(Path.resolve('package.json'));

        return {
            name: packageJson.name,
            version: packageJson.version,
            description: packageJson.description,
            author: packageJson.author,
        };
    }
}
