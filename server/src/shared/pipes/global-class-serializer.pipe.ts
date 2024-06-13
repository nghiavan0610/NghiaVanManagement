import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export class GlobalClassSerializerPipe {
    constructor(private reflector: Reflector) {}

    default() {
        return new ClassSerializerInterceptor(this.reflector, {
            strategy: 'excludeAll',
        });
    }
}
