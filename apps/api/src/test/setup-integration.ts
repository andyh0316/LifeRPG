import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import createClient from 'openapi-fetch';
import type { paths } from '../../../../packages/api-client/generated/openapi';
import type { AddressInfo } from 'net';
import { AppModule } from '../app.module';

export type ApiClient = ReturnType<typeof createClient<paths>>;

/** Bootstraps a NestJS app listening on a random port and returns the app, db, and typed API client. */
export async function createIntegrationApp(): Promise<{
  app: INestApplication;
  db: Db;
  client: ApiClient;
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

  // Listen on a random free port so the typed client can make real HTTP calls
  await app.listen(0);
  const addr = app.getHttpServer().address() as AddressInfo;

  // Create a typed OpenAPI client pointing at the test server
  const client = createClient<paths>({
    baseUrl: `http://127.0.0.1:${addr.port}`,
  });

  // Extract the database provider
  const db = app.get<Db>('DATABASE');

  return { app, db, client };
}
