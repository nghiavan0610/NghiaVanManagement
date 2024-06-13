import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class UploadImageResponseDto {
    @ApiProperty({ type: Boolean })
    success = true;

    @ApiProperty({ isArray: true, type: String })
    data: string[];

    constructor(data: string[]) {
        this.data = data;
    }
}
