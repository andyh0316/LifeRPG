import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { AppModule } from '../app.module';

/** Bootstraps a NestJS app pointing at TEST_DATABASE_URL and returns the app and db handles. */
export async function createIntegrationApp(): Promise<{
  app: INestApplication;
  db: ReturnType<typeof createDb>;
}> {
  // Validate that the test database URL is configured
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set');
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

  // Bootstrap the NestJS application with validation
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  // Extract the database provider
  const db = app.get<ReturnType<typeof createDb>>('DATABASE');

  return { app, db };
}
