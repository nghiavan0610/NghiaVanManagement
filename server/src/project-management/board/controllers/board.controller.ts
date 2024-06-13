import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { IBoardService } from '../services/board-service.interface';
import { CreateBoardResponseDto } from '../dtos/response/create-board-response.dto';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateBoardDto } from '../dtos/request/create-board.dto';
import { BoardListResponseDto } from '../dtos/response/board-list-response.dto';
import { GetBoardListByProjectDto } from '../dtos/request/get-board-list-by-project.dto';
import { BoardDetailResponseDto } from '../dtos/response/board-detail-response.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { UpdateBoardDto } from '../dtos/request/update-board.dto';
import { DeleteProofDto } from '../dtos/request/delete-proof.dto';

@Controller('boards')
export class BoardController {
    constructor(@Inject(IBoardService) private readonly boardService: IBoardService) {}

    // [POST] /boards/delete-proof
    @Post('delete-proof')
    @ApiOperation({ summary: 'Delete Proof.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async deleteProof(
        @GetAuthUser() authDto: AuthDto,
        @Body() deleteProofDto: DeleteProofDto,
    ): Promise<BooleanResponseDto> {
        deleteProofDto.userId = authDto._id;
        const result = await this.boardService.deleteProof(deleteProofDto);

        return new BooleanResponseDto(result);
    }

    // [PUT] /boards/:id
    @Put(':id')
    @ApiOperation({ summary: 'Update Board.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async updateBoard(
        @GetAuthUser() authDto: AuthDto,
        @Param('id') id: string,
        @Body() updateBoardDto: UpdateBoardDto,
    ): Promise<BooleanResponseDto> {
        updateBoardDto.userId = authDto._id;
        updateBoardDto.boardId = id;
        const result = await this.boardService.updateBoard(updateBoardDto);

        return new BooleanResponseDto(result);
    }

    // [GET] /boards/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get Board Detail By Id' })
    @ApiOkResponse({ type: BoardDetailResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getBoardDetail(@Param('id') id: string): Promise<BoardDetailResponseDto> {
        const result = await this.boardService.getBoardDetail(id);

        return new BoardDetailResponseDto(result);
    }

    // [GET] /boards?projectId=&month=
    @Get()
    @ApiOperation({ summary: 'Get Board List By Project.' })
    @ApiOkResponse({ type: BoardListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getBoardListByProject(@Query() filters: GetBoardListByProjectDto): Promise<BoardListResponseDto> {
        const result = await this.boardService.getBoardListByProject(filters);

        return new BoardListResponseDto(result);
    }

    // [POST] /boards
    @Post()
    @ApiOperation({ summary: 'Create Board.' })
    @ApiOkResponse({ type: CreateBoardResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createBoard(
        @GetAuthUser() authDto: AuthDto,
        @Body() createBoardDto: CreateBoardDto,
    ): Promise<CreateBoardResponseDto> {
        createBoardDto.userId = authDto._id;
        const result = await this.boardService.createBoard(createBoardDto);

        return new CreateBoardResponseDto(result);
    }
}
