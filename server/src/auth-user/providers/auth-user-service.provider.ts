import { Provider } from '@nestjs/common';
import { IAuthUserService } from '../services/auth-user-service.interface';
import { AuthUserService } from '../services/auth-user.service';

export const AuthUserServiceProvider: Provider = {
    provide: IAuthUserService,
    useClass: AuthUserService,
};
