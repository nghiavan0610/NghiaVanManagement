import { Provider } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { IAuthService } from '../services/auth-service.interface';

export const AuthServiceProvider: Provider = {
    provide: IAuthService,
    useClass: AuthService,
};
