import { JobDetailResponseDataDto } from '@/job/dtos/response/job-detail-response.dto';
import { IResponse } from '@/shared/interfaces/response.interface';
import { Gender, Role } from '@/user/schemas/user.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class UserInfoResponseDataDto {
    @ApiProperty()
    @Expose()
    @Transform(({ value }) => value && value.toString(), { toPlainOnly: true })
    _id: mongoose.Types.ObjectId;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiPropertyOptional()
    @Expose()
    @IsOptional()
    email: string;

    @ApiPropertyOptional()
    @Expose()
    @IsOptional()
    phoneNumber: string;

    @ApiPropertyOptional()
    @Expose()
    @IsOptional()
    dob: Date;

    @ApiPropertyOptional()
    @Expose()
    @IsOptional()
    address: string;

    @ApiProperty()
    @Expose()
    role: Role;

    @ApiProperty()
    @Expose()
    gender: Gender;

    @ApiProperty()
    @Expose()
    @IsOptional()
    slug: string;

    @ApiProperty()
    @Expose()
    @Type(() => JobDetailResponseDataDto)
    job: JobDetailResponseDataDto;

    // @ApiProperty()
    // @Expose()
    // @Type(() => ProjectDetailResponseDataDto)
    // projects: ProjectDetailResponseDataDto[];

    constructor(partial: Partial<UserInfoResponseDataDto>) {
        Object.assign(this, partial);
    }
}

@Expose()
export class UserInfoResponseDto implements IResponse<UserInfoResponseDataDto> {
    success = true;

    @Type(() => UserInfoResponseDataDto)
    data: UserInfoResponseDataDto;

    constructor(partial: UserInfoResponseDataDto) {
        this.data = partial;
        // this.data = new UserInfoResponseDataDto(partial);
    }
}
