import { Global, Module } from '@nestjs/common';
import { FileUtil } from './file/file.util';

@Global()
@Module({
    providers: [FileUtil],
    exports: [FileUtil],
})
export class UtilModule {}
