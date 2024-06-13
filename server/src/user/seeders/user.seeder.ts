import { ILoggerService } from '@/shared/modules/logger/services/logger-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { users } from 'db/devData';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserSeeder {
    constructor(
        @Inject(ILoggerService) private readonly logger: ILoggerService,
        private readonly userRepository: UserRepository,
    ) {}

    async seedUp(): Promise<void> {
        this.logger.info('[USER SEEDING UP]');

        const processedUsers = users.map((user: any) => {
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

            const processedUser: any = { ...user };
            Object.keys(processedUser).forEach((key) => {
                processedUser[key] = processField(key, processedUser[key]);
            });
            return processedUser;
        });

        await this.userRepository.insertMany(processedUsers);
    }

    async seedDown(): Promise<void> {
        this.logger.info('[USER SEEDING DOWN]');

        await this.userRepository.collectionDrop();
    }
}
