import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserServiceProvider } from './providers/user-service.provider';
import { IUserService } from './services/user-service.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { IsUniqueEmail } from './validators/user-email.validator';
import { IsUniquePhoneNumber } from './validators/user-phone.validator';
import { IsUniqueUsername } from './validators/username.validator';
import { UserSeeder } from './seeders/user.seeder';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [UserController],
    providers: [UserServiceProvider, UserRepository, IsUniqueUsername, IsUniqueEmail, IsUniquePhoneNumber, UserSeeder],
    exports: [IUserService, UserSeeder],
})
export class UserModule {}
