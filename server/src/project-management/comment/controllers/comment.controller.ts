import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ICommentService } from '../services/comment-service.interface';
import { CreateCommentDto } from '../dtos/request/create-comment.dto';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';

@Controller('comments')
export class CommentController {
    constructor(@Inject(ICommentService) private readonly commentService: ICommentService) {}

    // [POST] /comments
    @Post()
    @ApiOperation({ summary: 'Create Comment.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createComment(
        @GetAuthUser() authDto: AuthDto,
        @Body() createCommentDto: CreateCommentDto,
    ): Promise<BooleanResponseDto> {
        createCommentDto.userId = authDto._id;
        const result = await this.commentService.createComment(createCommentDto);

        return new BooleanResponseDto(result);
    }
}
