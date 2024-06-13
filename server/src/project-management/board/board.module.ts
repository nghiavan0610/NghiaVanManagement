import { Module } from '@nestjs/common';
import { BoardController } from './controllers/board.controller';
import { BoardServiceProvider } from './providers/board.provider';
import { IBoardService } from './services/board-service.interface';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './schemas/board.schema';
import { BoardRepository } from './repositories/board.repository';
import { ProjectModule } from '../project/project.module';
import { MemberModule } from '../member/member.module';
import { ProofModule } from '../proof/proof.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
        ProjectModule,
        MemberModule,
        ProofModule,
    ],
    controllers: [BoardController],
    providers: [BoardServiceProvider, BoardRepository],
    exports: [IBoardService],
})
export class BoardModule {}
