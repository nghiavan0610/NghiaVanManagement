import { Role } from '@/user/schemas/user.schema';

export class AuthDto {
    _id: string;
    username: string;
    role: Role;
    // accessToken?: string;
    // refreshToken?: string;
    sessionId: string;
}
