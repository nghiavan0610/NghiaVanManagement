import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { DeleteProofDto } from '../dtos/request/delete-proof.dto';
import { GetBoardListByProjectDto } from '../dtos/request/get-board-list-by-project.dto';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { BoardDetailResponseDataDto } from '../dtos/response/board-detail-response.dto';
import { Board } from '../schemas/board.schema';

export interface IBoardService {
    deleteProof(deleteProofDto: DeleteProofDto): Promise<boolean>;
    updateBoard(updateBoardDto: UpdateBoardDto): Promise<boolean>;
    getBoardDetail(id: string): Promise<BoardDetailResponseDataDto>;
    getBoardListByProject(filters: GetBoardListByProjectDto): Promise<BoardDetailResponseDataDto[]>;
    createBoard(createBoardDto: CreateBoardDto): Promise<BoardDetailResponseDataDto>;
    // ============================ START COMMON FUNCTION ============================
    _updateManyBoard(filter: FilterQuery<Board>, update: Board | any, options?: any): Promise<UpdateWriteOpResult>;
    _updateOneBoard(ilter: FilterQuery<Board>, update: UpdateQuery<Board>, options?: any): Promise<UpdateWriteOpResult>;
    _findByIdBoard(id: string, projection?: ProjectionType<Board>, options?: QueryOptions<Board>): Promise<Board>;
    _findAllBoard(
        filter?: FilterQuery<Board>,
        projection?: ProjectionType<Board>,
        options?: QueryOptions<Board>,
    ): Promise<Board[]>;
    // ============================ END COMMON FUNCTION ============================
}

export const IBoardService = Symbol('IBoardService');
