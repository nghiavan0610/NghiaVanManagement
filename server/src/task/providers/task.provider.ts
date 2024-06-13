import { Provider } from '@nestjs/common';
import { ITaskService } from '../services/task-service.interface';
import { TaskService } from '../services/task.service';

export const TaskServiceProvider: Provider = {
    provide: ITaskService,
    useClass: TaskService,
};
