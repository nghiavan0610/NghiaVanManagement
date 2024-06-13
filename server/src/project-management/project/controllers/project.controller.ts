import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { IProjectService } from '../services/project-service.interface';
import { CreateProjectResponseDto } from '../dtos/response/create-project-response.dto';
import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { Roles } from '@/shared/decorators/role.decorator';
import { RolesGuard } from '@/shared/guards/role.guard';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import GetAuthUser from '@/shared/decorators/get-auth-user.decorator';
import { AuthDto } from '@/shared/dtos/auth/auth.dto';
import { ProjectDetailResponseDto } from '../dtos/response/project-detail-response.dto';
import { BadRequestResponseDto } from '@/shared/dtos/response/bad-request-response.dto';
import { ProjectListResponseDto } from '../dtos/response/project-list-response.dto';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';
import { BooleanResponseDto } from '@/shared/dtos/response/boolean-response.dto';
import { DeleteProjectDto } from '../dtos/request/delete-project.dto';
import { ModifyProjectMemberDto } from '../dtos/request/modify-project-member.dto';

@Controller('projects')
export class ProjectController {
    constructor(@Inject(IProjectService) private readonly projectService: IProjectService) {}

    // [DELETE] /projects/:id
    @Delete(':id')
    @ApiOperation({ summary: 'Delete Project.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async deleteProject(@GetAuthUser() authDto: AuthDto, @Param('id') id: string): Promise<BooleanResponseDto> {
        const deleteProjectDto: DeleteProjectDto = { userId: authDto._id, id };
        const result = await this.projectService.deleteProject(deleteProjectDto);

        return new BooleanResponseDto(result);
    }

    // [PUT] /projects/:id/members
    @Put(':id/members')
    @ApiOperation({ summary: 'Modify Members of Project.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async modifyProjectMember(
        @GetAuthUser() authDto: AuthDto,
        @Param('id') id: string,
        @Body() modifyProjectMemberDto: ModifyProjectMemberDto,
    ): Promise<BooleanResponseDto> {
        modifyProjectMemberDto.userId = authDto._id;
        modifyProjectMemberDto.id = id;
        const result = await this.projectService.modifyProjectMember(modifyProjectMemberDto);

        return new BooleanResponseDto(result);
    }

    // [PUT] /projects/:id/detail
    @Put(':id/detail')
    @ApiOperation({ summary: 'Update Project Detail.' })
    @ApiOkResponse({ type: BooleanResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async updateProject(
        @GetAuthUser() authDto: AuthDto,
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ): Promise<BooleanResponseDto> {
        updateProjectDto.userId = authDto._id;
        updateProjectDto.id = id;
        const result = await this.projectService.updateProject(updateProjectDto);

        return new BooleanResponseDto(result);
    }

    // [GET] /projects/my-project
    @Get('my-project')
    @ApiOperation({ summary: 'Get My Project List' })
    @ApiOkResponse({ type: ProjectListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getMyProjectList(@GetAuthUser() authDto: AuthDto): Promise<ProjectListResponseDto> {
        const result = await this.projectService.getMyProjectList(authDto._id);

        return new ProjectListResponseDto(result);
    }

    // [GET] /projects/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get Project Detail By Id.' })
    @ApiOkResponse({ type: ProjectDetailResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getProjectDetail(@Param('id') id: string): Promise<ProjectDetailResponseDto> {
        const result = await this.projectService.getProjectDetail(id);

        return new ProjectDetailResponseDto(result);
    }

    // [GET] /projects
    @Get()
    @ApiOperation({ summary: 'Get Project List.' })
    @ApiOkResponse({ type: ProjectListResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    async getProjectList(): Promise<ProjectListResponseDto> {
        const result = await this.projectService.getProjectList();

        return new ProjectListResponseDto(result);
    }

    // [POST] /projects
    @Roles('admin', 'manager')
    @UseGuards(RolesGuard)
    @Post()
    @ApiOperation({ summary: 'Create Project.' })
    @ApiOkResponse({ type: CreateProjectResponseDto })
    @ApiBadRequestResponse({ type: BadRequestResponseDto })
    @HttpCode(HttpStatus.CREATED)
    async createProject(
        @GetAuthUser() authDto: AuthDto,
        @Body() createProjectDto: CreateProjectDto,
    ): Promise<CreateProjectResponseDto> {
        createProjectDto.userId = authDto._id;
        const result = await this.projectService.createProject(createProjectDto);

        return new CreateProjectResponseDto(result);
    }
}
