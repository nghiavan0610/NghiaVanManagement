import { Provider } from '@nestjs/common';
import { IProjectService } from '../services/project-service.interface';
import { ProjectService } from '../services/project.service';

export const ProjectServiceProvider: Provider = {
    provide: IProjectService,
    useClass: ProjectService,
};
