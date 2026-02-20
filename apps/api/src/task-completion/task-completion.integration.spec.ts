import { INestApplication } from '@nestjs/common';
import { taskCompletions, userCharacter, type Db } from '@life-rpg/database';
import { eq } from 'drizzle-orm';
import { TestAgent, createIntegrationApp } from '../../test/setup-integration';
import { CreateTaskDto } from '../task/dto/create-task.dto';
import { TaskResponseDto } from '../task/dto/task-response.dto';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';

describe('Task Completion Integration', () => {
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

  it('POST /task-completions - completes a block and returns earned rewards', async () => {
    // #region ----- SETUP -----
    const createRes = await request
      .post('/tasks')
      .send({
        name: 'Push-ups',
        desc: 'Do 20 push-ups',
        icon: 'muscle',
        blocks: [{ amount: 1, xpReward: 15, coinReward: 10 }],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = createRes.body;
    const completedAt = '2026-02-18T10:00:00.000Z';

    // #region ----- ACT -----
    const res = await request
      .post('/task-completions')
      .send({ blockId: task.blocks[0].id, completedAt })
      .expect(201);
    // #endregion

    // #region ----- ASSERT -----
    const completion: TaskCompletionResponseDto = res.body;
    expect(completion.id).toBeDefined();
    expect(completion.taskId).toBe(task.id);
    expect(completion.userCharacterId).toBe(currentUserCharacterId);
    expect(completion.xpEarned).toBe(15);
    expect(completion.coinsEarned).toBe(10);
    expect(completion.completedAt).toBe(completedAt);
  });

  it('POST /task-completions - each block returns its own rewards', async () => {
    // #region ----- SETUP -----
    const createRes = await request
      .post('/tasks')
      .send({
        name: 'Meditate',
        amountUnit: 'minutes',
        blocks: [
          { amount: 15, xpReward: 10, coinReward: 5 },
          { amount: 30, xpReward: 25, coinReward: 12 },
        ],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = createRes.body;
    // #endregion

    // #region ----- ACT -----
    const res1 = await request
      .post('/task-completions')
      .send({
        blockId: task.blocks[0].id,
        completedAt: '2026-02-18T10:00:00.000Z',
      })
      .expect(201);
    const res2 = await request
      .post('/task-completions')
      .send({
        blockId: task.blocks[1].id,
        completedAt: '2026-02-18T10:05:00.000Z',
      })
      .expect(201);
    // #endregion

    // #region ----- ASSERT -----
    const c1: TaskCompletionResponseDto = res1.body;
    expect(c1.xpEarned).toBe(10);
    expect(c1.coinsEarned).toBe(5);

    const c2: TaskCompletionResponseDto = res2.body;
    expect(c2.xpEarned).toBe(25);
    expect(c2.coinsEarned).toBe(12);
    // #endregion
  });

  // it('GET /task-completions/weekly-tracker - returns daily totals per task', async () => {
  //   // setup
  //   const taskRes = await request
  //     .post('/tasks')
  //     .send({
  //       name: 'Meditate',
  //       icon: '🧘',
  //       amountUnit: 'minutes',
  //       blocks: [
  //         { amount: 15, xpReward: 10, coinReward: 5 },
  //         { amount: 30, xpReward: 20, coinReward: 10 },
  //       ],
  //     } as CreateTaskDto)
  //     .expect(201);
  //   const task: TaskResponseDto = taskRes.body;

  //   // complete the 15-min block twice and the 30-min block once (today)
  //   await request
  //     .post('/task-completions')
  //     .send({ blockId: task.blocks[0].id })
  //     .expect(201);
  //   await request
  //     .post('/task-completions')
  //     .send({ blockId: task.blocks[0].id })
  //     .expect(201);
  //   await request
  //     .post('/task-completions')
  //     .send({ blockId: task.blocks[1].id })
  //     .expect(201);

  //   // act
  //   const today = new Date();
  //   const monday = new Date(today);
  //   monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  //   const weekStart = monday.toISOString().slice(0, 10);

  //   const res = await request
  //     .get('/task-completions/weekly-tracker')
  //     .query({ weekStart })
  //     .expect(200);

  //   // assert
  //   const body: WeeklyTrackerTaskDto[] = res.body;
  //   expect(Array.isArray(body)).toBe(true);
  //   // TODO: assert dailyTotals once the endpoint is implemented
  // });

  it('GET /task-completions - returns completions for the current user', async () => {
    // #region ----- SETUP -----
    const createRes = await request
      .post('/tasks')
      .send({
        name: 'Read',
        blocks: [
          { amount: 1, xpReward: 10, coinReward: 5 },
          { amount: 2, xpReward: 20, coinReward: 10 },
        ],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = createRes.body;
    await request
      .post('/task-completions')
      .send({
        blockId: task.blocks[0].id,
        completedAt: '2026-02-18T10:00:00.000Z',
      })
      .expect(201);
    await request
      .post('/task-completions')
      .send({
        blockId: task.blocks[1].id,
        completedAt: '2026-02-18T10:05:00.000Z',
      })
      .expect(201);
    // #endregion

    // #region ----- ACT -----
    const res = await request.get('/task-completions').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const completions: TaskCompletionResponseDto[] = res.body;
    expect(completions).toHaveLength(2);
    expect(completions[0].userCharacterId).toBe(currentUserCharacterId);
    expect(completions[1].userCharacterId).toBe(currentUserCharacterId);
    // #endregion
  });

  it('POST /task-completions/undo - deletes most recent completion and reverses rewards', async () => {
    // #region ----- SETUP -----
    const createRes = await request
      .post('/tasks')
      .send({
        name: 'Undo Test',
        blocks: [{ amount: 1, xpReward: 20, coinReward: 10 }],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = createRes.body;

    const [charBefore] = await db
      .select({ xp: userCharacter.xp, coins: userCharacter.coins })
      .from(userCharacter)
      .where(eq(userCharacter.id, currentUserCharacterId));

    await request
      .post('/task-completions')
      .send({
        blockId: task.blocks[0].id,
        completedAt: new Date().toISOString(),
      })
      .expect(201);
    // #endregion

    // #region ----- ACT -----
    const res = await request.post('/task-completions/undo').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const undone: TaskCompletionResponseDto = res.body;
    expect(undone.taskId).toBe(task.id);
    expect(undone.xpEarned).toBe(20);
    expect(undone.coinsEarned).toBe(10);

    const [charAfter] = await db
      .select({ xp: userCharacter.xp, coins: userCharacter.coins })
      .from(userCharacter)
      .where(eq(userCharacter.id, currentUserCharacterId));
    expect(charAfter.xp).toBe(charBefore.xp);
    expect(charAfter.coins).toBe(charBefore.coins);

    const listRes = await request.get('/task-completions').expect(200);
    expect(listRes.body).toHaveLength(0);

    // undo again after backdating — should return 400 when older than 24h
    await request
      .post('/task-completions')
      .send({
        blockId: task.blocks[0].id,
        completedAt: new Date().toISOString(),
      })
      .expect(201);

    await db
      .update(taskCompletions)
      .set({ completedAt: new Date(Date.now() - 25 * 60 * 60 * 1000) });

    await request.post('/task-completions/undo').expect(400);
    // #endregion
  });
});
