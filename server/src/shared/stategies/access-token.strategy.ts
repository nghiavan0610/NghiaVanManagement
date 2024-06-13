import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IRedisService } from '../modules/redis/services/redis-service.interface';
import { AuthError } from '@/auth/enums/auth-error.enum';
import { TokenPayload } from '@/auth-user/interfaces/token-payload.interface';
import { IAuthUserService } from '@/auth-user/services/auth-user-service.interface';
import { IUserService } from '@/user/services/user-service.interface';
import { UserError } from '@/user/enums/user-error.enum';
import { CustomException } from '../exceptions/custom.exception';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access-token') {
    constructor(
        readonly configService: ConfigService,
        @Inject(IRedisService) private readonly redisService: IRedisService,
        @Inject(IAuthUserService) private readonly authUserService: IAuthUserService,
        @Inject(IUserService) private readonly userService: IUserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('auth.access.secret'),
        });
    }

    async validate(tokenPayload: TokenPayload) {
        try {
            const sessionId = tokenPayload?.sessionId;
            if (!sessionId) {
                throw new CustomException({
                    message: AuthError.UNAUTHORIZED,
                    statusCode: HttpStatus.UNAUTHORIZED,
                });
            }

            let userInfo: any = await this.redisService.get(`accessToken:${sessionId}`);
            if (!userInfo) {
                await this.authUserService.deleteBySessionId(sessionId);
                throw new CustomException({
                    message: AuthError.TOKEN_REVOKED,
                    statusCode: HttpStatus.UNAUTHORIZED,
                });
            }
            userInfo = JSON.parse(userInfo);

            // Check user
            const user = await this.userService._getUserById(userInfo._id);
            if (!user) {
                throw new CustomException({
                    message: UserError.USER_NOT_FOUND,
                    statusCode: HttpStatus.NOT_FOUND,
                });
            }

            return {
                _id: userInfo._id,
                role: userInfo.role,
                username: userInfo.username,
                // accessToken: userInfo?.token,
                sessionId: sessionId,
            };
        } catch (err) {
            throw new CustomException({
                message: AuthError.UNAUTHORIZED,
                statusCode: HttpStatus.UNAUTHORIZED,
            });
        }
    }
}
