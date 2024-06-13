import { UserError } from '@/user/enums/user-error.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MinLength } from 'class-validator';
import * as _ from 'lodash';

export class ChangePasswordDto {
    id: string;

    @ApiProperty({ type: String })
    @IsNotEmpty({ message: UserError.PASSWORD_EMPTY })
    oldPassword: string;

    @ApiProperty({ type: String })
    @IsNotEmpty({ message: UserError.NEW_PASSWORD_EMPTY })
    @MinLength(8, { message: UserError.NEW_PASSWORD_LENGTH })
    // @Matches(/^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z\d]*$/, {
    //     message: UserError.NEW_PASSWORD_INVALID,
    // })
    @Transform(({ value }) => _.trim(value))
    newPassword: string;

    @ApiProperty({ type: String })
    @IsNotEmpty({ message: UserError.CONFIRM_PASSWORD_EMPTY })
    @Transform(({ value }) => _.trim(value))
    confirmPassword: string;
}
