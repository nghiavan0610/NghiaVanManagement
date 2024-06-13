import { Provider } from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { ILeaveService } from '../services/leave-service.interface';

export const LeaveServiceProvider: Provider = {
    provide: ILeaveService,
    useClass: LeaveService,
};
