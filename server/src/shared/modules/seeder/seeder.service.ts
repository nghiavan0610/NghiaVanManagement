import { Inject, Injectable } from '@nestjs/common';
import { ILoggerService } from '../logger/services/logger-service.interface';
import { UserSeeder } from '@/user/seeders/user.seeder';
import { JobSeeder } from '@/job/seeders/job.seeder';
import { ProjectSeeder } from '@/project-management/project/seeders/project.seeder';
import { MaterialSeeder } from '@/supply/material/seeders/material.seeder';
import { CategorySeeder } from '@/supply/category/seeders/category.seeder';
import { SummarySeeder } from '@/summary/seeders/summary.seeder';
import { AuthUserSeeder } from '@/auth-user/seeders/auth-user.seeder';
import { MemberSeeder } from '@/project-management/member/seeders/member.seeder';
import { ProofSeeder } from '@/project-management/proof/seeders/proof.seeder';

@Injectable()
export class SeederService {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly jobSeeder: JobSeeder,
        private readonly userSeeder: UserSeeder,
        private readonly authUserSeeder: AuthUserSeeder,
        private readonly projectSeeder: ProjectSeeder,
        private readonly memberSeeder: MemberSeeder,
        private readonly proofSeeder: ProofSeeder,
        // private readonly commentSeeder: CommentSeeder,
        private readonly categorySeeder: CategorySeeder,
        private readonly materialSeeder: MaterialSeeder,
        private readonly summarySeeder: SummarySeeder,
    ) {}

    async up() {
        try {
            this.logger.info('[START SEEDING UP]');

            await this.jobSeeder.seedUp();
            await this.userSeeder.seedUp();
            await this.authUserSeeder.seedUp();
            await this.projectSeeder.seedUp();
            await this.memberSeeder.seedUp();
            await this.proofSeeder.seedUp();
            // await this.commentSeeder.seedUp();
            await this.categorySeeder.seedUp();
            await this.materialSeeder.seedUp();
            await this.summarySeeder.seedUp();

            this.logger.info('[END SEEDING UP]');
        } catch (err) {
            this.logger.debug('[SEEDING UP FAILED] err', err);
        }
    }

    async down() {
        try {
            this.logger.info('[START SEEDING DOWN]');

            await this.jobSeeder.seedDown();
            await this.userSeeder.seedDown();
            await this.authUserSeeder.seedDown();
            await this.projectSeeder.seedDown();
            await this.memberSeeder.seedDown();
            await this.proofSeeder.seedDown();
            // await this.commentSeeder.seedDown();
            await this.categorySeeder.seedDown();
            await this.materialSeeder.seedDown();
            await this.summarySeeder.seedDown();

            this.logger.info('[END SEEDING DOWN]');
        } catch (err) {
            this.logger.debug('[SEEDING DOWN FAILED] err', err);
        }
    }
}
