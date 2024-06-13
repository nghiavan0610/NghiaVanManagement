import { Inject, Injectable } from '@nestjs/common';
import { ITokenService } from './token-service.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { AuthUserRepository } from '../respositories/auth-user.repository';
import { IRedisService } from '@/shared/modules/redis/services/redis-service.interface';
import { IToken } from '../interfaces/token.interface';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { User } from '@/user/schemas/user.schema';

@Injectable()
export class TokenService implements ITokenService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly authUserRepository: AuthUserRepository,
        @Inject(IRedisService) private readonly redisService: IRedisService,
    ) {}

    async generateUserToken(user: User): Promise<IToken> {
        const accessJwtSecret = this.configService.get('auth.access.secret');
        const accessJwtExpiresIn = this.configService.get('auth.access.expiresIn');
        const refreshJwtSecret = this.configService.get('auth.refresh.secret');
        const refreshJwtExpiresIn = this.configService.get('auth.refresh.expiresIn');

        // Generate user token
        const redisKey = await this.generateRedisKey();
        const tokenPayload: TokenPayload = {
            userId: user._id,
            sessionId: redisKey,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.signToken(tokenPayload, accessJwtSecret, accessJwtExpiresIn),
            this.signToken(tokenPayload, refreshJwtSecret, refreshJwtExpiresIn),
        ]);

        // Save user info into redis
        await Promise.all([
            this.saveRedisDataForUser(`accessToken:${redisKey}`, accessJwtExpiresIn, user, accessToken),
            this.saveRedisDataForUser(`refreshToken:${redisKey}`, refreshJwtExpiresIn, user, refreshToken),
        ]);

        await this.authUserRepository.create({ userId: user._id, sessionId: redisKey });

        return { accessToken, refreshToken };
    }

    private async saveRedisDataForUser(key: string, ttl: number, user: Partial<User>, token: string): Promise<void> {
        const redisValue = {
            _id: user._id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            token: token,
        };
        await this.redisService.set(key, JSON.stringify(redisValue), ttl);
    }

    private async signToken(payload: TokenPayload, secret: string, expiresIn: number): Promise<string> {
        return this.jwtService.signAsync(payload, { secret, expiresIn: expiresIn / 60 + 'm' });
    }

    private async generateRedisKey(): Promise<string> {
        return crypto.randomBytes(16).toString('hex');
    }
}
