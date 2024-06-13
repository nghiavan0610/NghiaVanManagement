import { Provider } from '@nestjs/common';
import { IBoardService } from '../services/board-service.interface';
import { BoardService } from '../services/board.service';

export const BoardServiceProvider: Provider = {
    provide: IBoardService,
    useClass: BoardService,
};
