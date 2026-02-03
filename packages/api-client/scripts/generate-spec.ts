import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../apps/api/src/app.module';
import { createSwaggerDocument } from '../../../apps/api/src/swagger';

/** Builds the OpenAPI spec in-process from NestJS controllers, no running server needed. */
async function main() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const spec = createSwaggerDocument(app);
  writeFileSync(
    new URL('../openapi.json', import.meta.url),
    JSON.stringify(spec, null, 2) + '\n',
  );
  console.log('Wrote openapi.json');

  await app.close();
}

main();
