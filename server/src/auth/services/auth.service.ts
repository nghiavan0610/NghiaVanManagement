import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './auth-service.interface';
import { SigninResponseDataDto } from '../dtos/response/signin-response.dto';
import { SigninDto } from '../dtos/request/signin.dto';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { IUserService } from '@/user/services/user-service.interface';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { AuthError } from '../enums/auth-error.enum';
import { IPasswordService } from '@/auth-user/services/password-service.interface';
import { UserError } from '@/user/enums/user-error.enum';
import { ITokenService } from '@/auth-user/services/token-service.interface';
import { ExtendedUser } from '../interfaces/extended-user.interface';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { IRedisService } from '@/shared/modules/redis/services/redis-service.interface';
import { IAuthUserService } from '@/auth-user/services/auth-user-service.interface';
import { RefreshTokenResponseDataDto } from '../dtos/response/refresh-token-response.dto';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(IUserService) private readonly userService: IUserService,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(IPasswordService) private readonly passwordService: IPasswordService,
        @Inject(ITokenService) private readonly tokenService: ITokenService,
        @Inject(IRedisService) private readonly redisService: IRedisService,
        @Inject(IAuthUserService) private readonly authUserService: IAuthUserService,
    ) {}

    // [GET] /auth/refresh
    async refreshToken(authDto: AuthDto): Promise<RefreshTokenResponseDataDto> {
        this.logger.info('[REFRESH TOKEN] authDto', authDto);

        const user = await this.userService._getUserById(authDto._id);

        return await this.tokenService.generateUserToken(user);
    }

    // [POST] /auth/signout
    async signout(authDto: AuthDto): Promise<void> {
        this.logger.info('[LOGOUT] authDto', authDto);

        if (authDto) {
            await Promise.all([
                this.redisService.del(`accessToken:${authDto.sessionId}`),
                this.redisService.del(`refreshToken:${authDto.sessionId}`),
            ]);
            await this.authUserService.deleteBySessionId(authDto.sessionId);
        }
    }

    // [POST] /auth/signin
    async signin(signinDto: SigninDto): Promise<SigninResponseDataDto> {
        this.logger.info('[SIGNIN] signinDto', signinDto);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { username, password } = signinDto;

        const user: ExtendedUser = await this.userService._getUserForValidate({ username });

        if (!user) {
            throw new CustomException({
                message: AuthError.NOT_FOUND,
                statusCode: HttpStatus.UNAUTHORIZED,
            });
        }

        const match = await this.passwordService.comparePassword(password, user.password);
        if (!match) {
            throw new CustomException({
                message: UserError.PASSWORD_NOT_CORRECT,
                statusCode: HttpStatus.UNAUTHORIZED,
            });
        }

        const { accessToken, refreshToken } = await this.tokenService.generateUserToken(user);
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        return user;
    }
}
