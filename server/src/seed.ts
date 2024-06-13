import { NestFactory } from '@nestjs/core';
import { SeederModule } from './shared/modules/seeder/seeder.module';
import { SeederService } from './shared/modules/seeder/seeder.service';

async function bootstrap() {
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    const seeder = appContext.get(SeederService);

    try {
        const action = process.argv[2];

        if (action === 'up') {
            await seeder.up();
            console.log('Seeding completed successfully!');
        } else if (action === 'down') {
            await seeder.down();
            console.log('Unseeding completed successfully!');
        } else {
            console.error('Invalid action. Please specify either "up" or "down".');
        }
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await appContext.close();
    }
}
bootstrap();
