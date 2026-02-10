import { INestApplication } from '@nestjs/common';
import { taskCompletions, type Db } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { GoalsResponseDto } from './dto/goals-response.dto';
import { CreateTaskDto } from '../task/dto/create-task.dto';
import { TaskResponseDto } from '../task/dto/task-response.dto';
import { UserCharacterService } from './user-character.service';

describe('User Character Integration', () => {
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

  it('GET /user-character/goals - returns null when no goals exist', async () => {
    // act
    const res = await request.get('/user-character/goals').expect(200);

    // assert
    expect(res.body).toEqual({});
  });

  it('PATCH /user-character/goals - creates goals when none exist', async () => {
    // act
    const res = await request
      .patch('/user-character/goals')
      .send({ dailyXpTarget: 100 })
      .expect(200);

    // assert
    const body: GoalsResponseDto = res.body;
    expect(body.id).toBeDefined();
    expect(body.userCharacterId).toBe(currentUserCharacterId);
    expect(body.dailyXpTarget).toBe(100);
    expect(body.weeklyXpTarget).toBeNull();
    expect(body.monthlyXpTarget).toBeNull();
    expect(body.quarterlyXpTarget).toBeNull();
    expect(body.yearlyXpTarget).toBeNull();
  });

  it('GET /user-character/goals - returns current goals after PATCH', async () => {
    // setup
    await request
      .patch('/user-character/goals')
      .send({ dailyXpTarget: 100 })
      .expect(200);

    // act
    const res = await request.get('/user-character/goals').expect(200);

    // assert
    const body: GoalsResponseDto = res.body;
    expect(body.userCharacterId).toBe(currentUserCharacterId);
    expect(body.dailyXpTarget).toBe(100);
  });

  it('PATCH /user-character/goals - updates only sent fields, preserves others', async () => {
    // setup
    await request
      .patch('/user-character/goals')
      .send({ dailyXpTarget: 100 })
      .expect(200);

    // act
    const res = await request
      .patch('/user-character/goals')
      .send({ weeklyXpTarget: 500 })
      .expect(200);

    // assert
    const body: GoalsResponseDto = res.body;
    expect(body.dailyXpTarget).toBe(100);
    expect(body.weeklyXpTarget).toBe(500);
  });

  it('PATCH /user-character/goals - can set a target to null to clear it', async () => {
    // setup
    await request
      .patch('/user-character/goals')
      .send({ dailyXpTarget: 100, weeklyXpTarget: 500 })
      .expect(200);

    // act
    const res = await request
      .patch('/user-character/goals')
      .send({ dailyXpTarget: null })
      .expect(200);

    // assert
    const body: GoalsResponseDto = res.body;
    expect(body.dailyXpTarget).toBeNull();
    expect(body.weeklyXpTarget).toBe(500);
  });

  it('getGoalsProgress - aggregates XP by time-period boundaries', async () => {
    // Tests that progress XP is correctly totalled for each period:
    // today, this week, this month, this quarter, this year.
    //
    // "Today" (fixed reference): 2026-05-15
    // Insert task completion entries at:
    //  - start of today=2026-05-15 00:00:00 (10xp)
    //  - start of this week=2026-05-11 (10xp)
    //  - start of this month=2026-05-01 (10xp)
    //  - start of this quarter=2026-04-01 (10xp)
    //  - start of this year=2026-01-01 (10xp)
    //  - sometimes last year=2025-01-01 (10xp)
    // Expected:
    //  - daily=10
    //  - weekly=20
    //  - monthly=30
    //  - quarterly=40
    //  - yearly=50

    // #region setup
    const referenceTime = new Date('2026-05-15T12:00:00Z');

    const taskRes = await request
      .post('/tasks')
      .send({
        name: 'Boundary Test Task',
        blocks: [{ amount: 1, xpReward: 1, coinReward: 0 }],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = taskRes.body;

    await db.insert(taskCompletions).values([
      {
        userCharacterId: currentUserCharacterId,
        taskId: task.id,
        xpEarned: 10,
        coinsEarned: 0,
        completedAt: new Date('2026-05-15T00:00:00Z'),
      }, // day start
      {
        userCharacterId: currentUserCharacterId,
        taskId: task.id,
        xpEarned: 10,
        coinsEarned: 0,
        completedAt: new Date('2026-05-11T00:00:00Z'),
      }, // week start (Mon)
      {
        userCharacterId: currentUserCharacterId,
        taskId: task.id,
        xpEarned: 10,
        coinsEarned: 0,
        completedAt: new Date('2026-05-01T00:00:00Z'),
      }, // month start
      {
        userCharacterId: currentUserCharacterId,
        taskId: task.id,
        xpEarned: 10,
        coinsEarned: 0,
        completedAt: new Date('2026-04-01T00:00:00Z'),
      }, // quarter start
      {
        userCharacterId: currentUserCharacterId,
        taskId: task.id,
        xpEarned: 10,
        coinsEarned: 0,
        completedAt: new Date('2026-01-01T00:00:00Z'),
      }, // year start
      {
        userCharacterId: currentUserCharacterId,
        taskId: task.id,
        xpEarned: 10,
        coinsEarned: 0,
        completedAt: new Date('2025-01-01T00:00:00Z'),
      }, // last year (excluded)
    ]);

    // #endregion setup

    // #region act
    const service = app.get(UserCharacterService);
    const body = await service.getGoalsProgress(
      currentUserCharacterId,
      referenceTime,
    );
    // #endregion act

    // #region assert
    expect(body.daily.current).toBe(10);
    expect(body.weekly.current).toBe(20);
    expect(body.monthly.current).toBe(30);
    expect(body.quarterly.current).toBe(40);
    expect(body.yearly.current).toBe(50);
    // #endregion assert
  });

  it('getGoalsProgress - uses client timezone for period boundaries', async () => {
    // A completion at 2026-05-15 03:00 UTC = 2026-05-14 23:00 America/New_York.
    // With UTC: falls on May 15 -> counts in daily XP for May 15.
    // With America/New_York: falls on May 14 -> does NOT count in daily XP for May 15.

    // setup
    const referenceTime = new Date('2026-05-15T12:00:00Z');

    const taskRes = await request
      .post('/tasks')
      .send({
        name: 'TZ Test Task',
        blocks: [{ amount: 1, xpReward: 1, coinReward: 0 }],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = taskRes.body;

    await db.insert(taskCompletions).values([
      {
        userCharacterId: currentUserCharacterId,
        taskId: task.id,
        xpEarned: 25,
        coinsEarned: 0,
        completedAt: new Date('2026-05-15T03:00:00Z'),
      },
    ]);

    // act
    const service = app.get(UserCharacterService);
    const utcResult = await service.getGoalsProgress(
      currentUserCharacterId,
      referenceTime,
      'UTC',
    );
    const nyResult = await service.getGoalsProgress(
      currentUserCharacterId,
      referenceTime,
      'America/New_York',
    );

    // assert
    expect(utcResult.daily.current).toBe(25);
    expect(nyResult.daily.current).toBe(0);
    // Both should include it in weekly total (same week regardless of tz)
    expect(utcResult.weekly.current).toBe(25);
    expect(nyResult.weekly.current).toBe(25);
  });
});
