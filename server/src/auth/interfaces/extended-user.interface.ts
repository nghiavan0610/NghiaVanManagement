import { User } from '@/user/schemas/user.schema';

export interface ExtendedUser extends User {
    accessToken?: string;
    refreshToken?: string;
}
