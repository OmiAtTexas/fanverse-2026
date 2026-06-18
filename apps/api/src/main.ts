import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] });
  app.setGlobalPrefix('api/v1');
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`API running on port ${port}`);
}
bootstrap();
// cache bust Thu Jun 18 15:23:42 CDT 2026
