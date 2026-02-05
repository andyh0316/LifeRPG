import { execSync } from 'child_process';

export default function globalSetup() {
  execSync('pnpm --filter @life-rpg/database build && pnpm test-db:reset', {
    stdio: 'inherit',
  });
}
