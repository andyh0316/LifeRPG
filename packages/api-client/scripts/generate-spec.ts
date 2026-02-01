import { writeFileSync } from 'node:fs';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function main() {
  const res = await fetch(`${API_URL}/api-json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`);
  }
  const spec = await res.json();
  writeFileSync(
    new URL('../openapi.json', import.meta.url),
    JSON.stringify(spec, null, 2) + '\n',
  );
  console.log('Wrote openapi.json');
}

main();
