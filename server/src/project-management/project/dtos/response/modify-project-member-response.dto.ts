import { IResponse } from '@/shared/interfaces/response.interface';
import { Expose, Type } from 'class-transformer';
import { ProjectDetailResponseDataDto } from './project-detail-response.dto';

@Expose()
export class ModifyProjectMemberResponseDto implements IResponse<ProjectDetailResponseDataDto> {
    success = true;

    @Type(() => ProjectDetailResponseDataDto)
    data: ProjectDetailResponseDataDto;

    constructor(partial: ProjectDetailResponseDataDto) {
        this.data = partial;
        // this.data = new ProjectDetailResponseDataDto(partial);
    }
}
