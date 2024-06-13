import { RequestLeaveDto } from '../dtos/request/request-leave.dto';
import { Leave } from '../schemas/leave.schema';
import { LeaveDetailResponseDataDto } from '../dtos/response/leave-detail-response.dto';
import { GetLeaveListDto } from '../dtos/request/get-leave-list.dto';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';

export interface ILeaveService {
    getLeaveDetail(id: string): Promise<LeaveDetailResponseDataDto>;
    getLeaveListByMonth(filters: GetLeaveListDto): Promise<LeaveDetailResponseDataDto[]>;
    requestLeave(requestLeaveDto: RequestLeaveDto): Promise<boolean>;

    // ============================ START COMMON FUNCTION ============================
    _getLeaveDetail(
        filter: FilterQuery<Leave>,
        projection?: ProjectionType<Leave>,
        options?: QueryOptions<Leave>,
    ): Promise<Leave>;
    // ============================ END COMMON FUNCTION ============================
}

export const ILeaveService = Symbol('ILeaveService');
