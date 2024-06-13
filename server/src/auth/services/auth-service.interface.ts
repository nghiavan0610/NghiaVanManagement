import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { SigninResponseDataDto } from '../dtos/response/signin-response.dto';
import { SigninDto } from '../dtos/request/signin.dto';
import { RefreshTokenResponseDataDto } from '../dtos/response/refresh-token-response.dto';

export interface IAuthService {
    refreshToken(authDto: AuthDto): Promise<RefreshTokenResponseDataDto>;
    signout(authDto: AuthDto): Promise<void>;
    signin(signinDto: SigninDto): Promise<SigninResponseDataDto>;
}

export const IAuthService = Symbol('IAuthService');
