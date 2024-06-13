import { AuthError } from '@/auth/enums/auth-error.enum';
import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { CustomException } from '../exceptions/custom.exception';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-token') {
    constructor() {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    handleRequest<TUser = any>(err: any, user: any): TUser {
        if (err || !user) {
            throw new CustomException({
                message: AuthError.UNAUTHORIZED,
                statusCode: HttpStatus.UNAUTHORIZED,
            });
        }

        return user;
    }
}
