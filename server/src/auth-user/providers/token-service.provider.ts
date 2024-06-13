import { Provider } from '@nestjs/common';
import { ITokenService } from '../services/token-service.interface';
import { TokenService } from '../services/token.service';

export const TokenServiceProvider: Provider = {
    provide: ITokenService,
    useClass: TokenService,
};
