import {
    FilterQuery,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    UpdateWriteOpResult,
} from 'mongoose';
import { CreateProjectDto } from '../dtos/request/create-project.dto';
import { DeleteProjectDto } from '../dtos/request/delete-project.dto';
import { ModifyProjectMemberDto } from '../dtos/request/modify-project-member.dto';
import { ProjectDetailResponseDataDto } from '../dtos/response/project-detail-response.dto';
import { UpdateProjectDto } from '../dtos/request/update-project.dto';
import { Project } from '../schemas/project.schema';

export interface IProjectService {
    deleteProject(deleteProjectDto: DeleteProjectDto): Promise<boolean>;
    modifyProjectMember(modifyProjectMemberDto: ModifyProjectMemberDto): Promise<boolean>;
    updateProject(updateProjectDto: UpdateProjectDto): Promise<boolean>;
    getProjectDetail(id: string): Promise<ProjectDetailResponseDataDto>;
    getMyProjectList(userId: string): Promise<ProjectDetailResponseDataDto[]>;
    getProjectList(): Promise<ProjectDetailResponseDataDto[]>;
    createProject(createProjectDto: CreateProjectDto): Promise<ProjectDetailResponseDataDto>;
    // ============================ START COMMON FUNCTION ============================
    _updateProject(
        filter?: FilterQuery<Project>,
        update?: UpdateWithAggregationPipeline | UpdateQuery<Project>,
        options?: any,
    ): Promise<UpdateWriteOpResult>;
    _getProjectForValidate(filter: FilterQuery<Project>, exceptId?: string): Promise<Project>;
    _findByIdProject(
        id: string,
        projection?: ProjectionType<Project>,
        options?: QueryOptions<Project>,
    ): Promise<Project>;
    // ============================ END COMMON FUNCTION ============================
}

export const IProjectService = Symbol('IProjectService');
