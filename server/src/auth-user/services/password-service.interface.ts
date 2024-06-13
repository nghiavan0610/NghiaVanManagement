export interface IPasswordService {
    encodePassword(password: string): Promise<string>;
    comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}

export const IPasswordService = Symbol('IPasswordService');
