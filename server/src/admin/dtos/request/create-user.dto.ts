// import { Transform } from 'class-transformer';
import { UniqueEmail } from '@/user/validators/user-email.validator';
import { UniquePhoneNumber } from '@/user/validators/user-phone.validator';
import { UserError } from '@/user/enums/user-error.enum';
import { Gender, Role } from '@/user/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, Matches, IsOptional, IsDate, IsEnum } from 'class-validator';
import * as _ from 'lodash';
import { UniqueUsername } from '@/user/validators/username.validator';
import { JobError } from '@/job/enums/job-error.enum';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty({ message: UserError.USER_NAME_EMPTY })
    @UniqueUsername({ message: UserError.USER_NAME_EXISTED })
    username: string;

    @ApiProperty()
    @IsNotEmpty({ message: UserError.FULL_NAME_EMPTY })
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty({ message: UserError.EMAIL_EMPTY })
    @IsEmail({}, { message: UserError.EMAIL_INVALID })
    @Transform(({ value }) => _.trim(value))
    @UniqueEmail({ message: UserError.EMAIL_EXISTED })
    email?: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty({ message: UserError.PHONE_NUMBER_EMPTY })
    @Matches(/(84|0[3|5|7|8|9])+([0-9]{8,9})\b/g, {
        message: UserError.PHONE_NUMBER_INVALID,
    })
    @UniquePhoneNumber({ message: UserError.PHONE_NUMBER_EXISTED })
    @Transform(({ value }) => _.trim(value))
    phoneNumber?: string;

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

    @ApiProperty()
    @IsOptional()
    @IsEnum(Role)
    role: Role;

    @ApiProperty()
    @IsNotEmpty({ message: JobError.JOB_ID_EMPTY })
    jobId: string;
}
