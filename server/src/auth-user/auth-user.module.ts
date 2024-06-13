import { Global, Module } from '@nestjs/common';
import { AuthUserRepository } from './respositories/auth-user.repository';
import { PasswordServiceProvider } from './providers/password-service.provider';
import { TokenServiceProvider } from './providers/token-service.provider';
import { IAuthUserService } from './services/auth-user-service.interface';
import { ITokenService } from './services/token-service.interface';
import { IPasswordService } from './services/password-service.interface';
import { AuthUserServiceProvider } from './providers/auth-user-service.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthUser, AuthUserSchema } from './schemas/auth-user.schema';
import { AuthUserSeeder } from './seeders/auth-user.seeder';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: AuthUser.name, schema: AuthUserSchema }])],
    providers: [
        AuthUserServiceProvider,
        AuthUserRepository,
        PasswordServiceProvider,
        TokenServiceProvider,
        AuthUserSeeder,
    ],
    exports: [IAuthUserService, ITokenService, IPasswordService, AuthUserSeeder],
})
export class AuthUserModule {}
