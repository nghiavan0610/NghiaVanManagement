import { UserError } from '@/user/enums/user-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
    @ApiProperty({ type: String })
    @IsNotEmpty({ message: UserError.USER_ID_EMPTY })
    id: string;
}
