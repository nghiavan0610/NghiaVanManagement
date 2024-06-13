import * as FsExtra from 'fs-extra';
import * as Path from 'path';
import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => {
    const packageJson = FsExtra.readJSONSync(Path.resolve('package.json'));

    return {
        path: process.env.SWAGGER_PATH || '@/swagger',
        version: packageJson.version,
        title: packageJson.name,
        description: packageJson.description,
    };
});
