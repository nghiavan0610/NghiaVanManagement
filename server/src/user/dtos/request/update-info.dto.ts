// import { Transform } from 'class-transformer';
import { UserError } from '@/user/enums/user-error.enum';
import { Gender } from '@/user/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, Matches, IsOptional, IsDate, IsEnum } from 'class-validator';
import * as _ from 'lodash';

export class UpdateInfoDto {
    id: string;

    @ApiProperty()
    @IsNotEmpty({ message: UserError.USER_NAME_EMPTY })
    username: string;

    @ApiProperty()
    @IsNotEmpty({ message: UserError.FULL_NAME_EMPTY })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: UserError.EMAIL_EMPTY })
    @IsEmail({}, { message: UserError.EMAIL_INVALID })
    @Transform(({ value }) => _.trim(value))
    email: string;

    @ApiProperty()
    @IsNotEmpty({ message: UserError.PHONE_NUMBER_EMPTY })
    @Matches(/(84|0[3|5|7|8|9])+([0-9]{8,9})\b/g, {
        message: UserError.PHONE_NUMBER_INVALID,
    })
    @Transform(({ value }) => _.trim(value))
    phoneNumber: string;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => value && new Date(value))
    @IsDate({ message: UserError.DOB_INVALID })
    dob?: Date;

    @ApiProperty()
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiProperty()
    @IsOptional()
    address?: string;
}
