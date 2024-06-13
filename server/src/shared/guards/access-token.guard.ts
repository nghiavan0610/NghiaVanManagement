import { AuthError } from '@/auth/enums/auth-error.enum';
import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CustomException } from '../exceptions/custom.exception';

@Injectable()
export class AccessTokenGuard extends AuthGuard('access-token') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [context.getHandler(), context.getClass()]);

        if (isPublic) return true;

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw new CustomException({
                message: AuthError.UNAUTHORIZED,
                statusCode: HttpStatus.UNAUTHORIZED,
            });
        }

        return user;
    }
}
