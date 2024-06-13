import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from './schemas/member.schema';
import { MemberServiceProvider } from './providers/member.provider';
import { IMemberService } from './services/member-service.interface';
import { MemberRepository } from './repositories/member.repository';
import { MemberSeeder } from './seeders/member.seeder';

@Module({
    imports: [MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }])],
    providers: [MemberServiceProvider, MemberRepository, MemberSeeder],
    exports: [IMemberService, MemberSeeder],
})
export class MemberModule {}
