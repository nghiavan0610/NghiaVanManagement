import { Expose } from 'class-transformer';

@Expose()
export class HealthResponseDataDto {
    name: string;

    version: string;

    description: string;

    author: string;

    constructor(partial: Partial<HealthResponseDataDto>) {
        Object.assign(this, partial);
    }
}
