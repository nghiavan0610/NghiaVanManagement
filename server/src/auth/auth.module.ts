import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthServiceProvider } from './providers/auth-service.provider';
import { IAuthService } from './services/auth-service.interface';
import { UserModule } from '@/user/user.module';

@Module({
    imports: [UserModule],
    controllers: [AuthController],
    providers: [AuthServiceProvider],
    exports: [IAuthService],
})
export class AuthModule {}
