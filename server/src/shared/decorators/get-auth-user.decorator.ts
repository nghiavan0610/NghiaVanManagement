import { ExecutionContext, createParamDecorator } from '@nestjs/common';

const GetAuthUser = createParamDecorator((_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    return request.user;
});

export default GetAuthUser;
