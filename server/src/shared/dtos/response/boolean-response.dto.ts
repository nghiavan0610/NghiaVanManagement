import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose } from 'class-transformer';

@Expose()
export class BooleanResponseDto implements IResponse<any> {
    success = true;

    data: boolean;

    constructor(partial: boolean) {
        this.data = partial;
    }
}
