import { Provider } from '@nestjs/common';
import { IUserService } from '../services/user-service.interface';
import { UserService } from '../services/user.service';

export const UserServiceProvider: Provider = {
    provide: IUserService,
    useClass: UserService,
};
