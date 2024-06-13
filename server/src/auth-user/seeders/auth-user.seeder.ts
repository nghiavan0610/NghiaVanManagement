import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { authusers } from 'db/devData';
import { AuthUserRepository } from '../respositories/auth-user.repository';

@Injectable()
export class AuthUserSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly authUserRepository: AuthUserRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[AUTH USER SEEDING UP]');

        const processedAuthUsers = authusers.map((authUser: any) => {
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

            const processedAuthUser: any = { ...authUser };
            Object.keys(processedAuthUser).forEach((key) => {
                processedAuthUser[key] = processField(key, processedAuthUser[key]);
            });
            return processedAuthUser;
        });

        await this.authUserRepository.insertMany(processedAuthUsers);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[AUTH USER SEEDING DOWN]');

        await this.authUserRepository.collectionDrop();
    }
}
