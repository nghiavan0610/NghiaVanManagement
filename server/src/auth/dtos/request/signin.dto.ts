import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
    @ApiProperty({ type: String, example: 'Lorem' })
    username: string;

    @ApiProperty({ type: String, example: 'Lorem' })
    password: string;
}
