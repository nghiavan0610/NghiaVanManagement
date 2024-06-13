import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IBoardService } from './board-service.interface';
import { BoardRepository } from '../repositories/board.repository';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { BoardDetailResponseDataDto } from '../dtos/response/board-detail-response.dto';
import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { IProjectService } from '@/project-management/project/services/project-service.interface';
import { ProjectError } from '@/project-management/project/enums/project-error.enum';
import { CustomException } from '@/shared/exceptions/custom.exception';
import { MemberRole } from '@/project-management/member/schemas/member.schema';
import { IMemberService } from '@/project-management/member/services/member-service.interface';
import { ConfigService } from '@nestjs/config';
import { BoardError } from '../enums/board-error.enum';
import { IProofService } from '@/project-management/proof/services/proof-service.interface';
import { GetBoardListByProjectDto } from '../dtos/request/get-board-list-by-project.dto';
import { DateTimeHelper } from '@/shared/helpers/date-time.helper';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { DeleteProofDto } from '../dtos/request/delete-proof.dto';
import { ProofError } from '@/project-management/proof/enums/proof-error.enum';
import { FilterQuery, ProjectionType, QueryOptions, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { Board } from '../schemas/board.schema';

@Injectable()
export class BoardService implements IBoardService {
    constructor(
        private readonly configService: ConfigService,
        private readonly boardRepository: BoardRepository,
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        @Inject(IProjectService) private readonly projectService: IProjectService,
        @Inject(IMemberService) private readonly memberService: IMemberService,
        @Inject(IProofService) private readonly proofService: IProofService,
    ) {}

    // [POST] /boards/delete-proof
    async deleteProof(deleteProofDto: DeleteProofDto): Promise<boolean> {
        this.logger.info('[DELETE PROOF], deleteProofDto', deleteProofDto);

        const { userId, boardId, proofId } = deleteProofDto;

        // Check exist board
        const board = await this.boardRepository.findById(boardId, null, {
            populate: 'project',
        });
        if (!board) {
            throw new CustomException({
                message: BoardError.BOARD_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check User belong to Project or not
        const member = board.project.members.find((member) => member.user._id.toString() === userId);
        if (!member || member.role !== MemberRole.manager) {
            throw new CustomException({
                message: BoardError.BOARD_NOT_PERMISSION,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        // Check exist proof
        const proof = await this.proofService._findByIdProof(proofId, null, { populate: 'author' });
        if (!proof) {
            throw new CustomException({
                message: ProofError.PROOF_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check proof author
        if (proof.author._id.toString() !== userId) {
            throw new CustomException({
                message: ProofError.PROOF_NOT_PERMISSION,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        // Delete Proof
        await this.proofService._deleteProof({ _id: proofId });

        // Remove proof out of relation board
        await this.boardRepository.updateOne({ _id: boardId }, { $pull: { proofs: proofId } });

        return true;
    }

    // [PUT] /boards/:id
    async updateBoard(updateBoardDto: UpdateBoardDto): Promise<boolean> {
        this.logger.info('[UPDATE BOARD], updateBoardDto', updateBoardDto);

        const { boardId, userId, ...restDto } = updateBoardDto;

        const board = await this.boardRepository.findById(boardId, null, {
            populate: 'project',
        });
        if (!board) {
            throw new CustomException({
                message: BoardError.BOARD_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        const update: any = {};

        // Permission: only project manager can update locked timesheet
        const member = board.project.members.find((member) => member.user._id.toString() === userId);
        if (board.isLocked) {
            if (member && member.role === MemberRole.manager) {
                if (restDto?.isApproved !== undefined) {
                    update.isApproved = restDto.isApproved;
                }
            } else {
                throw new CustomException({
                    message: BoardError.BOARD_NOT_PERMISSION,
                    statusCode: HttpStatus.BAD_REQUEST,
                });
            }
        }

        // Update proofs
        if (restDto?.proofs) {
            // Create Proofs
            const proofIds = await Promise.all(
                restDto.proofs.map(async (proof: string) => {
                    const proofName = proof.split('/').pop();

                    const createdProof = await this.proofService._createProof({
                        name: proofName,
                        url: proof,
                        // isApproved: proofName.startsWith(PROOF_NAME_START_WITH) ? true : false,
                        author: userId,
                    });

                    return createdProof._id;
                }),
            );

            update.$push = {
                proofs: proofIds,
            };
        }

        await this.boardRepository.updateOne({ _id: boardId }, update);

        return true;
    }

    // [GET] /boards/:id
    async getBoardDetail(id: string): Promise<BoardDetailResponseDataDto> {
        this.logger.info('[GET BOARD DETAIL], id', id);

        const board = await this.boardRepository.findById(id, null, {
            populate: [
                {
                    path: 'proofs',
                    populate: {
                        path: 'author',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'job',
                            },
                        },
                    },
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'author',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'job',
                            },
                        },
                    },
                },
            ],
        });

        if (!board) {
            throw new CustomException({
                message: BoardError.BOARD_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Presign proofs url
        await Promise.all(
            board.proofs.map(async (proof) => {
                this._presignProofUrl(proof.url);
            }),
        );

        return board;
    }

    // [GET] /boards?projectId=&month=
    async getBoardListByProject(filters: GetBoardListByProjectDto): Promise<BoardDetailResponseDataDto[]> {
        this.logger.info('[GET BOARD LIST BY PROJECT], filters', filters);

        const filter: any = {
            project: filters.projectId,
        };

        if (filters?.month) {
            const firstDay = DateTimeHelper.getFirstDayOfMonth(filters?.month);
            const lastDay = DateTimeHelper.getLastDayOfMonth(filters?.month);

            filter.date = {
                $gte: firstDay,
                $lte: lastDay,
            };
        }

        const boards = await this.boardRepository.findAll(filter, null, {
            populate: [
                {
                    path: 'proofs',
                    populate: {
                        path: 'author',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'job',
                            },
                        },
                    },
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'author',
                        populate: {
                            path: 'user',
                            populate: {
                                path: 'job',
                            },
                        },
                    },
                },
            ],
            sort: {
                date: 1,
                shift: 1,
            },
        });

        // Presign proofs url
        await Promise.all(
            boards.map(async (board) => {
                board.proofs.map(async (proof) => {
                    this._presignProofUrl(proof.url);
                });
            }),
        );

        return boards;
    }

    // [POST] /boards
    async createBoard(createBoardDto: CreateBoardDto): Promise<BoardDetailResponseDataDto> {
        this.logger.info('[CREATE BOARD], createBoardDto', createBoardDto);

        const { userId, projectId, proofs, ...restDto } = createBoardDto;

        // Check exist project
        const project = await this.projectService._findByIdProject(projectId, null, {
            populate: {
                path: 'members',
                populate: {
                    path: 'user',
                },
            },
        });
        if (!project) {
            throw new CustomException({
                message: ProjectError.PROJECT_NOT_FOUND,
                statusCode: HttpStatus.NOT_FOUND,
            });
        }

        // Check exist board
        const existedTimesheet = await this.boardRepository.findOne({
            project: project._id,
            date: restDto.date,
            shift: restDto.shift,
        });
        if (existedTimesheet) {
            throw new CustomException({
                message: BoardError.BOARD_EXISTED,
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }

        // Check User belong to Project or not, If not create support member
        let member = project.members.find((member) => member.user._id.toString() === userId);
        if (!member) {
            member = await this.memberService._findOneAndUpdateMember(
                { user: userId, role: MemberRole.support },
                { user: userId, role: MemberRole.support },
                { upsert: true },
            );
        }

        // Create Proofs
        const proofIds = await Promise.all(
            proofs.map(async (proof: string) => {
                const proofName = proof.split('/').pop();

                const createdProof = await this.proofService._createProof({
                    name: proofName,
                    url: proof,
                    // isApproved: proofName.startsWith(PROOF_NAME_START_WITH) ? true : false,
                    author: member._id,
                });

                return createdProof._id;
            }),
        );

        // Create Board
        return this.boardRepository.create({
            project: project._id,
            date: restDto.date,
            shift: restDto.shift,
            proofs: proofIds,
        });
    }

    // ============================ START COMMON FUNCTION ============================
    private _presignProofUrl(url: string): string {
        if (!url.includes(this.configService.get('aws.s3.endpoint') + '/toantamec-proof')) {
            url = [this.configService.get('aws.s3.endpoint'), this.configService.get('aws.s3.bucket'), url].join('/');
        }

        return url;
    }

    async _updateManyBoard(
        filter: FilterQuery<Board>,
        update: Board | any,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.boardRepository.updateMany(filter, update, options);
    }

    async _updateOneBoard(
        filter: FilterQuery<Board>,
        update: UpdateQuery<Board>,
        options?: any,
    ): Promise<UpdateWriteOpResult> {
        return this.boardRepository.updateOne(filter, update, options);
    }

    async _findByIdBoard(
        id: string,
        projection?: ProjectionType<Board>,
        options?: QueryOptions<Board>,
    ): Promise<Board> {
        return this.boardRepository.findById(id, projection, options);
    }

    async _findAllBoard(
        filter?: FilterQuery<Board>,
        projection?: ProjectionType<Board>,
        options?: QueryOptions<Board>,
    ): Promise<Board[]> {
        return this.boardRepository.findAll(filter, projection, options);
    }
    // ============================ END COMMON FUNCTION ============================
}
