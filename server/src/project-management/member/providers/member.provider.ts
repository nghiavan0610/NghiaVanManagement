import { Provider } from '@nestjs/common';
import { IMemberService } from '../services/member-service.interface';
import { MemberService } from '../services/member.service';

export const MemberServiceProvider: Provider = {
    provide: IMemberService,
    useClass: MemberService,
};
