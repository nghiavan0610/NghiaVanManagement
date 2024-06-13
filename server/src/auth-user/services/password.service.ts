import { Injectable } from '@nestjs/common';
import { IPasswordService } from './password-service.interface';
import { hash, verify } from 'argon2';

@Injectable()
export class PasswordService implements IPasswordService {
    async encodePassword(password: string): Promise<string> {
        return hash(password);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return verify(hashedPassword, password);
    }
}
