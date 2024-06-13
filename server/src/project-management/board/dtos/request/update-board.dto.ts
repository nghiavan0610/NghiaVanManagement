import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class UpdateBoardDto {
    userId: string;

    boardId: string;

    @ApiProperty({ isArray: true, type: String })
    @IsArray()
    @IsOptional()
    proofs?: string[] | [];

    @ApiProperty({ type: Boolean })
    @IsOptional()
    isApproved?: boolean;
}
