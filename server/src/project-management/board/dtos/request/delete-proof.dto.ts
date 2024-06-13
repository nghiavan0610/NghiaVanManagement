import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BoardError } from '../../enums/board-error.enum';
import { ProofError } from '@/project-management/proof/enums/proof-error.enum';

export class DeleteProofDto {
    userId: string;

    @ApiProperty()
    @IsNotEmpty({ message: BoardError.BOARD_ID_EMPTY })
    boardId: string;

    @ApiProperty()
    @IsNotEmpty({ message: ProofError.PROOF_ID_EMPTY })
    proofId: string;
}
