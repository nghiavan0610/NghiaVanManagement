import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { members } from 'db/devData';
import { MemberRepository } from '@/project-management/member/repositories/member.repository';

@Injectable()
export class MemberSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly memberRepository: MemberRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[MEMBER SEEDING UP]');

        const processedMembers = members.map((member: any) => {
            const processField = (key: string, value: any) => {
                if (value?.$oid) {
                    return value.$oid;
                }
                if (Array.isArray(value)) {
                    return value.map((item: any) => processField('', item));
                }
                if (value?.$date) {
                    return new Date(value.$date);
                }
                return value;
            };

            const processedMember: any = { ...member };
            Object.keys(processedMember).forEach((key) => {
                processedMember[key] = processField(key, processedMember[key]);
            });
            return processedMember;
        });

        await this.memberRepository.insertMany(processedMembers);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[MEMBER SEEDING DOWN]');

        await this.memberRepository.collectionDrop();
    }
}
