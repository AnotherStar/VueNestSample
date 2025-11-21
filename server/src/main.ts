import 'source-map-support/register';
import path from 'node:path';

import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'http://localhost:4443',
        credentials: true,
    });

    app.setGlobalPrefix('api');

    await app.listen(4444);
}

bootstrap();
