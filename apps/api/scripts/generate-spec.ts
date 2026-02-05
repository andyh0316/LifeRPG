import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createSwaggerDocument } from '../src/swagger';

/** Builds the OpenAPI spec in-process from NestJS controllers, no running server needed. */
async function main() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const spec = createSwaggerDocument(app);
  const outPath = resolve(
    __dirname,
    '../../../packages/api-client/openapi.json',
  );
  writeFileSync(outPath, JSON.stringify(spec, null, 2) + '\n');
  console.log('Wrote', outPath);

  await app.close();
}

main();
