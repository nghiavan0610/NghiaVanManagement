import { Injectable } from '@nestjs/common';
import { IAuthUserService } from './auth-user-service.interface';
import { AuthUserRepository } from '../respositories/auth-user.repository';
import { AuthUser } from '../schemas/auth-user.schema';

@Injectable()
export class AuthUserService implements IAuthUserService {
    constructor(private readonly authUserRepository: AuthUserRepository) {}

    // ============================ START COMMON FUNCTION ============================
    async findAllByUserId(userId: string): Promise<AuthUser[]> {
        return this.authUserRepository.findAll({ userId });
    }

    async deleteByUserId(userId: string): Promise<{ deletedCount: number }> {
        return this.authUserRepository.deleteMany({ userId });
    }

    async deleteBySessionId(sessionId: string): Promise<{ deletedCount: number }> {
        return this.authUserRepository.deleteOne({ sessionId });
    }
    // ============================ END COMMON FUNCTION ============================
}
