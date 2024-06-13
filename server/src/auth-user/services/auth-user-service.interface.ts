import { AuthUser } from '../schemas/auth-user.schema';

export interface IAuthUserService {
    // ============================ START COMMON FUNCTION ============================
    findAllByUserId(userId: string): Promise<AuthUser[]>;
    deleteByUserId(userId: string): Promise<{ deletedCount: number }>;
    deleteBySessionId(sessionId: string): Promise<{ deletedCount: number }>;
    // ============================ END COMMON FUNCTION ============================
}

export const IAuthUserService = Symbol('IAuthUserService');
