import { Provider } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { IAdminService } from '../services/admin-service.interface';

export const AdminServiceProvider: Provider = {
    provide: IAdminService,
    useClass: AdminService,
};
