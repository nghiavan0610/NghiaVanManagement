import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomException } from '../exceptions/custom.exception';
import { AdminError } from '@/admin/enums/admin-error.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userRole = request.user.role;

        if (!requiredRoles.includes(userRole)) {
            throw new CustomException({
                message: AdminError.NO_PERMISSION,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        return true;
    }
}
