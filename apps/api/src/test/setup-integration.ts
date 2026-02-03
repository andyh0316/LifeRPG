import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import supertest from 'supertest';
import { AppModule } from '../app.module';

export type TestAgent = supertest.Agent;

/** Bootstraps a NestJS app and returns the app, db, and supertest agent. */
export async function createIntegrationApp(): Promise<{
  app: INestApplication;
  db: Db;
  request: TestAgent;
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

  // Create a supertest agent bound to the app's HTTP server
  const request = supertest.agent(app.getHttpServer());

  // Extract the database provider
  const db = app.get<Db>('DATABASE');

  return { app, db, request };
}
