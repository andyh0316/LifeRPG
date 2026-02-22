import { INestApplication } from '@nestjs/common';
import { taskCompletions, tasks, type Db } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../../test/setup-integration';
import { createTestTask } from '../../test/factories';
import { TaskCompletionRepository } from '../task-completion/task-completion.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('Task Integration', () => {
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

  it('POST /tasks - rejects task without blocks', async () => {
    // #region ----- ACT -----
    await request
      .post('/tasks')
      .send({
        name: 'Push-ups',
        desc: 'Do some push-ups',
        icon: 'muscle',
      } as CreateTaskDto)
      .expect(400);
    // #endregion
  });

  it('POST /tasks - creates a task with blocks', async () => {
    // #region ----- SETUP -----
    const input: CreateTaskDto = {
      name: 'Meditate',
      desc: 'Daily meditation',
      icon: 'lotus',
      amountUnit: 'minutes',
      goalAmount: 600,
      goalPeriod: 'week-long',
      blocks: [
        { amount: 15, xpReward: 10, coinReward: 5 },
        { amount: 30, xpReward: 25, coinReward: 12 },
        { amount: 60, xpReward: 50, coinReward: 25 },
      ],
    };
    // #endregion

    // #region ----- ACT -----
    const res = await request.post('/tasks').send(input).expect(201);
    // #endregion

    // #region ----- ASSERT -----
    const task: TaskResponseDto = res.body;
    expect(task.id).toBeDefined();
    expect(task.name).toBe(input.name);
    expect(task.amountUnit).toBe('minutes');
    expect(task.goalAmount).toBe(600);
    expect(task.goalPeriod).toBe('week-long');
    expect(task.goalCompletedAmount).toBe(0);
    expect(task.blocks).toHaveLength(3);
    expect(task.blocks[0]).toMatchObject({
      amount: 15,
      xpReward: 10,
      coinReward: 5,
    });
    expect(task.blocks[1]).toMatchObject({
      amount: 30,
      xpReward: 25,
      coinReward: 12,
    });
    expect(task.blocks[2]).toMatchObject({
      amount: 60,
      xpReward: 50,
      coinReward: 25,
    });
    // #endregion
  });

  it('POST /tasks - rejects empty blocks array', async () => {
    // #region ----- ACT -----
    await request
      .post('/tasks')
      .send({
        name: 'Bad Task',
        blocks: [],
      } as CreateTaskDto)
      .expect(400);
    // #endregion
  });

  it('PUT /tasks/:id - rejects empty blocks array', async () => {
    // #region ----- SETUP -----
    const setupTask = await createTestTask(request);
    // #endregion

    // #region ----- ACT -----
    await request
      .put(`/tasks/${setupTask.id}`)
      .send({
        name: 'Valid Task',
        desc: null,
        icon: null,
        amountUnit: 'count',
        goalAmount: null,
        goalPeriod: null,
        blocks: [],
      } as unknown as UpdateTaskDto)
      .expect(400);
    // #endregion
  });

  it('PUT /tasks/:id - replaces task fields and blocks', async () => {
    // #region ----- SETUP -----
    const setupTask = await createTestTask(request, {
      name: 'Read',
      desc: 'Read a book',
      icon: 'book',
      amountUnit: 'minutes',
      blocks: [
        { amount: 15, xpReward: 10, coinReward: 5 },
        { amount: 30, xpReward: 25, coinReward: 12 },
        { amount: 60, xpReward: 50, coinReward: 25 },
      ],
    });

    const updateInput: UpdateTaskDto = {
      name: 'Read More',
      desc: 'Read two chapters',
      icon: 'books',
      amountUnit: 'minutes',
      goalAmount: 300,
      goalPeriod: 'month-long',
      blocks: [
        // blocks[0]: included with id — kept and updated
        {
          id: setupTask.blocks[0].id,
          amount: 15,
          xpReward: 10,
          coinReward: 5,
        },
        // blocks[1]: included with id — updated
        {
          id: setupTask.blocks[1].id,
          amount: 30,
          xpReward: 30,
          coinReward: 15,
        },
        // blocks[2]: omitted — deleted
        // new block
        { amount: 90, xpReward: 80, coinReward: 40 },
      ],
    };
    // #endregion

    // #region ----- ACT -----
    const res = await request
      .put(`/tasks/${setupTask.id}`)
      .send(updateInput)
      .expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const updatedTask: TaskResponseDto = res.body;
    expect(updatedTask.id).toBe(setupTask.id);
    expect(updatedTask.name).toBe(updateInput.name);
    expect(updatedTask.desc).toBe(updateInput.desc);
    expect(updatedTask.icon).toBe(updateInput.icon);
    expect(updatedTask.blocks).toHaveLength(3);

    // blocks[0]: kept with original values
    const kept = updatedTask.blocks.find(
      (o) => o.id === setupTask.blocks[0].id,
    );
    expect(kept).toMatchObject({
      amount: 15,
      xpReward: 10,
      coinReward: 5,
    });

    // blocks[1]: updated
    const updated = updatedTask.blocks.find(
      (o) => o.id === setupTask.blocks[1].id,
    );
    expect(updated).toMatchObject({ amount: 30, xpReward: 30, coinReward: 15 });

    // blocks[2]: omitted — deleted
    const deleted = updatedTask.blocks.find(
      (o) => o.id === setupTask.blocks[2].id,
    );
    expect(deleted).toBeUndefined();

    // new block: gets a fresh id
    const originalIds = setupTask.blocks.map((o) => o.id);
    const created = updatedTask.blocks.find((o) => !originalIds.includes(o.id));
    expect(created).toMatchObject({ amount: 90, xpReward: 80, coinReward: 40 });

    // goal fields updated
    expect(updatedTask.goalAmount).toBe(300);
    expect(updatedTask.goalPeriod).toBe('month-long');
    // #endregion
  });

  it('PUT /tasks/:id - preserves natural input order for blocks', async () => {
    // #region ----- SETUP -----
    const setupTask = await createTestTask(request, { name: 'Reorder Test' });
    // #endregion

    // #region ----- ACT -----
    const res = await request
      .put(`/tasks/${setupTask.id}`)
      .send({
        name: 'Reorder Test',
        desc: null,
        icon: null,
        amountUnit: 'count',
        goalAmount: null,
        goalPeriod: null,
        blocks: [
          { amount: 10, xpReward: 100, coinReward: 50 },
          {
            id: setupTask.blocks[0].id,
            amount: 1,
            xpReward: 10,
            coinReward: 5,
          },
          { amount: 20, xpReward: 200, coinReward: 100 },
        ],
      } as UpdateTaskDto)
      .expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const updatedTask: TaskResponseDto = res.body;
    expect(updatedTask.blocks).toHaveLength(3);
    expect(updatedTask.blocks[0]).toMatchObject({
      sortOrder: 0,
      amount: 10,
      xpReward: 100,
      coinReward: 50,
    });
    expect(updatedTask.blocks[1].id).toBe(setupTask.blocks[0].id);
    expect(updatedTask.blocks[1]).toMatchObject({
      sortOrder: 1,
      amount: 1,
      xpReward: 10,
      coinReward: 5,
    });
    expect(updatedTask.blocks[2]).toMatchObject({
      sortOrder: 2,
      amount: 20,
      xpReward: 200,
      coinReward: 100,
    });
    // #endregion
  });

  it('GET /tasks/:id - returns a task by id', async () => {
    // #region ----- SETUP -----
    const createdTask = await createTestTask(request, {
      name: 'Stretching',
      desc: 'Morning stretching routine',
      icon: 'yoga',
      blocks: [{ amount: 1, xpReward: 15, coinReward: 8 }],
    });
    // #endregion

    // #region ----- ACT -----
    const res = await request.get(`/tasks/${createdTask.id}`).expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const fetchedTask: TaskResponseDto = res.body;
    expect(fetchedTask.id).toBe(createdTask.id);
    expect(fetchedTask.userCharacterId).toBe(currentUserCharacterId);
    expect(fetchedTask.name).toBe('Stretching');
    expect(fetchedTask.desc).toBe('Morning stretching routine');
    expect(fetchedTask.icon).toBe('yoga');
    expect(fetchedTask.blocks).toHaveLength(1);
    // #endregion
  });

  it('DELETE /tasks/:id - soft-deletes a task', async () => {
    // #region ----- SETUP -----
    const created = await createTestTask(request, { name: 'To Delete' });
    // #endregion

    // #region ----- ACT -----
    const res = await request.delete(`/tasks/${created.id}`).expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const deleted: TaskResponseDto = res.body;
    expect(deleted.id).toBe(created.id);
    expect(deleted.name).toBe('To Delete');
    // #endregion
  });

  it('DELETE /tasks/:id - soft-deleted task excluded from GET /tasks', async () => {
    // #region ----- SETUP -----
    const created = await createTestTask(request, {
      name: 'Invisible After Delete',
    });
    await request.delete(`/tasks/${created.id}`).expect(200);
    // #endregion

    // #region ----- ACT -----
    const res = await request.get('/tasks').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const tasks: TaskResponseDto[] = res.body;
    const found = tasks.find((t) => t.id === created.id);
    expect(found).toBeUndefined();
    // #endregion
  });

  it('PATCH /tasks/reorder - persists new task order', async () => {
    // #region ----- SETUP -----
    const taskA = await createTestTask(request, { name: 'Reorder A' });
    const taskB = await createTestTask(request, { name: 'Reorder B' });
    const idA = taskA.id;
    const idB = taskB.id;
    // #endregion

    // #region ----- ACT -----
    await request
      .patch('/tasks/reorder')
      .send({ ids: [idB, idA] })
      .expect(204);
    // #endregion

    // #region ----- ASSERT -----
    const res = await request.get('/tasks').expect(200);
    const tasks: TaskResponseDto[] = res.body;
    const indexA = tasks.findIndex((t) => t.id === idA);
    const indexB = tasks.findIndex((t) => t.id === idB);
    expect(indexB).toBeLessThan(indexA);
    // #endregion
  });

  it('GET /tasks - returns all tasks with blocks', async () => {
    // #region ----- SETUP -----
    const createdTask = await createTestTask(request, {
      name: 'Journaling',
      desc: 'Write in journal',
      icon: 'pencil',
      blocks: [
        { amount: 1, xpReward: 10, coinReward: 5 },
        { amount: 1, xpReward: 20, coinReward: 10 },
      ],
    });
    // #endregion

    // #region ----- ACT -----
    const res = await request.get('/tasks').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const tasks: TaskResponseDto[] = res.body;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(createdTask.id);
    expect(tasks[0].name).toBe('Journaling');
    expect(tasks[0].blocks).toHaveLength(2);
    // #endregion
  });

  it('POST /tasks - auto-assigns sequential sortOrder per user', async () => {
    // #region ----- ACT -----
    const task1 = await createTestTask(request, { name: 'First Task' });
    const task2 = await createTestTask(request, { name: 'Second Task' });
    // #endregion

    // #region ----- ASSERT -----
    expect(task1.sortOrder).toBe(0);
    expect(task2.sortOrder).toBe(1);
    // #endregion
  });

  describe('GET /tasks - calculate goalCompletedAmount', () => {
    // prettier-ignore
    it('day-long - sum + timezone', async () => {
      // #region ----- SETUP -----
      const setupTask = await createTestTask(request, { goalPeriod: 'day-long' });
      // completedAt (Los Angeles): 2026-01-02T00:00:00 (beginning of 1/2)
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-02T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      // completedAt (Los Angeles): 2026-01-02T05:00:00 (mid of 1/2)
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-02T13:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      // completedAt (Los Angeles): 2026-01-02T23:59:59 (end of 1/2)
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-03T07:59:59Z'), xpEarned: 0, coinsEarned: 0 });
      // #endregion 

      // #region ----- ACT + ASSERT -----
      const find = (res: { body: unknown }) => (res.body as TaskResponseDto[]).find((t) => t.id === setupTask.id)!;
      {
        const res = await request.get('/tasks').set('x-timezone', 'America/Los_Angeles').query({ forDate: '2026-01-01' }).expect(200);
        expect(find(res).goalCompletedAmount).toBe(0);
      }
      {
        const res = await request.get('/tasks').set('x-timezone', 'America/Los_Angeles').query({ forDate: '2026-01-02' }).expect(200);
        expect(find(res).goalCompletedAmount).toBe(3);
      }
      {
        const res = await request.get('/tasks').set('x-timezone', 'UTC').query({ forDate: '2026-01-02' }).expect(200);
        expect(find(res).goalCompletedAmount).not.toBe(3);
      }
      {
        const res = await request.get('/tasks').set('x-timezone', 'America/Los_Angeles').query({ forDate: '2026-01-03' }).expect(200);
        expect(find(res).goalCompletedAmount).toBe(0);
      }
    });

    // prettier-ignore
    it('week-long - sum + timezone', async () => {
      // #region ----- SETUP -----
      const setupTask = await createTestTask(request, { goalPeriod: 'week-long' });
      // insert from 1/5 (mon) to 1/11 (sun): 7 days, total amount = 7
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-05T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-06T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-07T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-08T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-09T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-10T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      await db.insert(taskCompletions).values({ userCharacterId: currentUserCharacterId, taskId: setupTask.id, amount: 1, completedAt: new Date('2026-01-11T08:00:00Z'), xpEarned: 0, coinsEarned: 0 });
      // #endregion

      // #region ----- ACT + ASSERT -----
      const find = (res: { body: unknown }) => (res.body as TaskResponseDto[]).find((t) => t.id === setupTask.id)!;
      {
        const res = await request.get('/tasks').set('x-timezone', 'America/Los_Angeles').query({ forDate: '2026-01-04' }).expect(200);
        expect(find(res).goalCompletedAmount).toBe(0);
      }
      {
        const res = await request.get('/tasks').set('x-timezone', 'America/Los_Angeles').query({ forDate: '2026-01-05' }).expect(200);
        expect(find(res).goalCompletedAmount).toBe(7);
      }
      {
        const res = await request.get('/tasks').set('x-timezone', 'America/Los_Angeles').query({ forDate: '2026-01-11' }).expect(200);
        expect(find(res).goalCompletedAmount).toBe(7);
      }
      {
        const res = await request.get('/tasks').set('x-timezone', 'America/Los_Angeles').query({ forDate: '2026-01-12' }).expect(200);
        expect(find(res).goalCompletedAmount).toBe(0);
      }
      // UTC
    });
  });

  describe('GET /tasks - calculate streaks', () => {
    // prettier-ignore
    it('calculates day-long streak from daily completions', async () => {
      // setup:
      // create a task: goalPeriod = day-long, goalAmount = 2
      // create completions with all amounts = 1

      // #region ----- SETUP -----
      const task = await createTestTask(request, { name: 'Daily Streak Task', goalAmount: 2, goalPeriod: 'day-long', blocks: [{ amount: 1, xpReward: 0, coinReward: 0 }] });

      // prettier-ignore
      await db.insert(taskCompletions).values([
        // 1/1: 1+1=2 → meets goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-01'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-01'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        // 1/2: 1+1=2 → meets goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-02'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-02'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        // 1/3: 1 < 2 → misses goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-03'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        // 1/4: 1 < 2 → misses goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-04'), amount: 1, xpEarned: 0, coinsEarned: 0 },
      ]);
      // #endregion

      // #region ----- ASSERT -----
      const getStreak = async (forDate: string) => {
        const res = await request.get('/tasks').query({ forDate }).expect(200);
        return (res.body as TaskResponseDto[]).find((t) => t.id === task.id)!.currentStreak;
      };
      // 1/1: goal met (1+1=2), first day → streak 1
      expect(await getStreak('2026-01-01')).toBe(1);
      // 1/2: goal met, consecutive → streak 2
      expect(await getStreak('2026-01-02')).toBe(2);
      // 1/3: goal not met, but 1/2 is previous day → streak 2 (grace period)
      expect(await getStreak('2026-01-03')).toBe(2);
      // 1/4: 1/3 passed unmet, streak broken → 0
      expect(await getStreak('2026-01-04')).toBe(0);
      // #endregion
    });

    // prettier-ignore
    it('calculates week-long streak from weekly completions', async () => {
      // weeks start Monday: W1=12/29, W2=1/5, W3=1/12, W4=1/19
      // goalAmount=3: W1 meets (3), W2 meets (3), W3 misses (2), W4 misses (1)

      // #region ----- SETUP -----
      const task = await createTestTask(request, { name: 'Weekly Streak Task', goalAmount: 3, goalPeriod: 'week-long', blocks: [{ amount: 1, xpReward: 0, coinReward: 0 }] });

      // prettier-ignore
      await db.insert(taskCompletions).values([
        // W1 (12/29–1/4): 1+1+1=3 → meets goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2025-12-30'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-01'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-03'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        // W2 (1/5–1/11): 1+1+1=3 → meets goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-06'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-08'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-10'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        // W3 (1/12–1/18): 1+1=2 → misses goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-13'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-15'), amount: 1, xpEarned: 0, coinsEarned: 0 },
        // W4 (1/19–1/25): 1=1 → misses goal
        { userCharacterId: currentUserCharacterId, taskId: task.id, completedAt: new Date('2026-01-20'), amount: 1, xpEarned: 0, coinsEarned: 0 },
      ]);
      // #endregion

      // #region ----- ASSERT -----
      const getStreak = async (forDate: string) => {
        const res = await request.get('/tasks').query({ forDate }).expect(200);
        return (res.body as TaskResponseDto[]).find((t) => t.id === task.id)!.currentStreak;
      };
      // W1: first qualifying week → streak 1
      expect(await getStreak('2026-01-03')).toBe(1);
      // W2: consecutive with W1 → streak 2
      expect(await getStreak('2026-01-10')).toBe(2);
      // W3: goal not met, but W2 is previous week → streak 2 (grace period)
      expect(await getStreak('2026-01-15')).toBe(2);
      // W4: W3 passed unmet, streak broken → 0
      expect(await getStreak('2026-01-22')).toBe(0);
      // #endregion
    });
  });
});
