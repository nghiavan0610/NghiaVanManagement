import { User } from '@/user/schemas/user.schema';
import { IToken } from '../interfaces/token.interface';

export interface ITokenService {
    generateUserToken(user: User): Promise<IToken>;
}

export const ITokenService = Symbol('ITokenService');
