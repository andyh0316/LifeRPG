import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function createSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('LifeRPG API')
    .setVersion('0.1')
    .build();
  return SwaggerModule.createDocument(app, config);
}
