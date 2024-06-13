import { Provider } from '@nestjs/common';
import { IPasswordService } from '../services/password-service.interface';
import { PasswordService } from '../services/password.service';

export const PasswordServiceProvider: Provider = {
    provide: IPasswordService,
    useClass: PasswordService,
};
