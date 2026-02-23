import { INestApplication } from '@nestjs/common';
import { tasks, taskCompletions, type Db } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../../test/setup-integration';
import { TaskLogResponseDto } from './dto/task-log-response.dto';

describe('Task Log Integration', () => {
  let app: INestApplication;
  let db: Db;
  let request: TestAgent;
  let currentUserCharacterId: number;
  let startTransaction: () => Promise<void>;
  let rollbackTransaction: () => Promise<void>;

  beforeAll(async () => {
    ({
      app,
      db,
      request,
      currentUserCharacterId,
      startTransaction,
      rollbackTransaction,
    } = await createIntegrationApp());
  });

  beforeEach(async () => {
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });

  afterAll(async () => {
    await app.close();
  });

  // prettier-ignore
  it('GET /task-log - returns days with tasks and completions', async () => {
    // #region ----- SETUP -----
    const [meditate, pushups] = await db.insert(tasks).values([
      { userCharacterId: currentUserCharacterId, name: 'Meditate', amountUnit: 'minutes' as const },
      { userCharacterId: currentUserCharacterId, name: 'Push-ups', amountUnit: 'count' as const },
    ]).returning();

    await db.insert(taskCompletions).values([
      { userCharacterId: currentUserCharacterId, taskId: meditate.id, completedAt: new Date('2026-02-20T12:00:00Z'), amount: 1, xpEarned: 2, coinsEarned: 0 },
      { userCharacterId: currentUserCharacterId, taskId: meditate.id, completedAt: new Date('2026-02-20T18:00:00Z'), amount: 1, xpEarned: 2, coinsEarned: 0 },
      { userCharacterId: currentUserCharacterId, taskId: pushups.id, completedAt: new Date('2026-02-19T12:00:00Z'), amount: 1, xpEarned: 2, coinsEarned: 0 },
    ]);
    // #endregion

    // #region ----- ACT -----
    const res = await request.get('/task-log?pageSize=7&cursor=2026-02-22').set('x-timezone', 'UTC').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const body: TaskLogResponseDto = res.body;
    expect(body.tasks).toHaveLength(2);
    expect(body.tasks).toEqual([
      expect.objectContaining({ taskName: 'Meditate', amountUnit: 'minutes' }),
      expect.objectContaining({ taskName: 'Push-ups', amountUnit: 'count' }),
    ]);

    const day = (date: string) => body.days.find((d) => d.date === date)!;
    expect(day('2026-02-20').completions).toEqual([2, 0]);
    expect(day('2026-02-20').totalXp).toBe(4);
    expect(day('2026-02-19').completions).toEqual([0, 1]);
    expect(day('2026-02-19').totalXp).toBe(2);
    expect(day('2026-02-18').completions).toEqual([0, 0]);
    expect(day('2026-02-18').totalXp).toBe(0);
    // #endregion
  });
});
