import { INestApplication } from '@nestjs/common';
import { taskCompletions, type Db } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../../test/setup-integration';
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
    await request
      .post('/tasks')
      .send({
        name: 'Push-ups',
        desc: 'Do some push-ups',
        icon: 'muscle',
      } as CreateTaskDto)
      .expect(400);
  });

  it('POST /tasks - creates a task with blocks', async () => {
    // setup
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

    // act
    const res = await request.post('/tasks').send(input).expect(201);

    // assert
    const task: TaskResponseDto = res.body;
    expect(task.id).toBeDefined();
    expect(task.name).toBe(input.name);
    expect(task.amountUnit).toBe('minutes');
    expect(task.goalAmount).toBe(600);
    expect(task.goalPeriod).toBe('week-long');
    expect(task.goalCompletedAmount).toBeNull();
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
  });

  it('POST /tasks - rejects empty blocks array', async () => {
    await request
      .post('/tasks')
      .send({
        name: 'Bad Task',
        blocks: [],
      } as CreateTaskDto)
      .expect(400);
  });

  it('PUT /tasks/:id - rejects empty blocks array', async () => {
    // setup
    const setupRes = await request
      .post('/tasks')
      .send({
        name: 'Valid Task',
        blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);

    // act & assert
    await request
      .put(`/tasks/${setupRes.body.id}`)
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
  });

  it('PUT /tasks/:id - replaces task fields and blocks', async () => {
    // setup — create task with 3 blocks
    const setupRes = await request
      .post('/tasks')
      .send({
        name: 'Read',
        desc: 'Read a book',
        icon: 'book',
        amountUnit: 'minutes',
        blocks: [
          { amount: 15, xpReward: 10, coinReward: 5 },
          { amount: 30, xpReward: 25, coinReward: 12 },
          { amount: 60, xpReward: 50, coinReward: 25 },
        ],
      } as CreateTaskDto)
      .expect(201);
    const setupTask: TaskResponseDto = setupRes.body;

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

    // act
    const res = await request
      .put(`/tasks/${setupTask.id}`)
      .send(updateInput)
      .expect(200);

    // assert
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
  });

  it('PUT /tasks/:id - preserves natural input order for blocks', async () => {
    // setup — create task with 1 block
    const setupRes = await request
      .post('/tasks')
      .send({
        name: 'Reorder Test',
        blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);
    const setupTask: TaskResponseDto = setupRes.body;

    // act — send [new, existing, new]
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

    // assert — blocks returned in input order
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
  });

  it('GET /tasks/:id - returns a task by id', async () => {
    // setup
    const input: CreateTaskDto = {
      name: 'Stretching',
      desc: 'Morning stretching routine',
      icon: 'yoga',
      blocks: [{ amount: 1, xpReward: 15, coinReward: 8 }],
    };
    const createRes = await request.post('/tasks').send(input).expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    // act
    const res = await request.get(`/tasks/${createdTask.id}`).expect(200);

    // assert
    const fetchedTask: TaskResponseDto = res.body;
    expect(fetchedTask.id).toBe(createdTask.id);
    expect(fetchedTask.userCharacterId).toBe(currentUserCharacterId);
    expect(fetchedTask.name).toBe(input.name);
    expect(fetchedTask.desc).toBe(input.desc);
    expect(fetchedTask.icon).toBe(input.icon);
    expect(fetchedTask.blocks).toHaveLength(1);
  });

  it('DELETE /tasks/:id - soft-deletes a task', async () => {
    // setup
    const setupRes = await request
      .post('/tasks')
      .send({
        name: 'To Delete',
        blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);
    const created: TaskResponseDto = setupRes.body;

    // act
    const res = await request.delete(`/tasks/${created.id}`).expect(200);

    // assert
    const deleted: TaskResponseDto = res.body;
    expect(deleted.id).toBe(created.id);
    expect(deleted.name).toBe('To Delete');
  });

  it('DELETE /tasks/:id - soft-deleted task excluded from GET /tasks', async () => {
    // setup
    const setupRes = await request
      .post('/tasks')
      .send({
        name: 'Invisible After Delete',
        blocks: [{ amount: 1, xpReward: 5, coinReward: 2 }],
      } as CreateTaskDto)
      .expect(201);
    const created: TaskResponseDto = setupRes.body;
    await request.delete(`/tasks/${created.id}`).expect(200);

    // act
    const res = await request.get('/tasks').expect(200);

    // assert
    const tasks: TaskResponseDto[] = res.body;
    const found = tasks.find((t) => t.id === created.id);
    expect(found).toBeUndefined();
  });

  it('PATCH /tasks/reorder - persists new task order', async () => {
    // setup
    const taskA = await request
      .post('/tasks')
      .send({
        name: 'Reorder A',
        blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);
    const taskB = await request
      .post('/tasks')
      .send({
        name: 'Reorder B',
        blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);
    const idA: number = taskA.body.id;
    const idB: number = taskB.body.id;

    // act — reverse order: B before A
    await request
      .patch('/tasks/reorder')
      .send({ ids: [idB, idA] })
      .expect(204);

    // assert
    const res = await request.get('/tasks').expect(200);
    const tasks: TaskResponseDto[] = res.body;
    const indexA = tasks.findIndex((t) => t.id === idA);
    const indexB = tasks.findIndex((t) => t.id === idB);
    expect(indexB).toBeLessThan(indexA);
  });

  it('GET /tasks - returns all tasks with blocks', async () => {
    // setup
    const input: CreateTaskDto = {
      name: 'Journaling',
      desc: 'Write in journal',
      icon: 'pencil',
      blocks: [
        { amount: 1, xpReward: 10, coinReward: 5 },
        { amount: 1, xpReward: 20, coinReward: 10 },
      ],
    };
    const createRes = await request.post('/tasks').send(input).expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    // act
    const res = await request.get('/tasks').expect(200);

    // assert
    const tasks: TaskResponseDto[] = res.body;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe(createdTask.id);
    expect(tasks[0].name).toBe(input.name);
    expect(tasks[0].blocks).toHaveLength(2);
  });

  it('POST /tasks - auto-assigns sequential sortOrder per user', async () => {
    // act
    const res1 = await request
      .post('/tasks')
      .send({
        name: 'First Task',
        blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);
    const res2 = await request
      .post('/tasks')
      .send({
        name: 'Second Task',
        blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);

    // assert
    const task1: TaskResponseDto = res1.body;
    const task2: TaskResponseDto = res2.body;
    expect(task1.sortOrder).toBe(0);
    expect(task2.sortOrder).toBe(1);
  });

  it('GET /tasks - returns goalCompletedAmount from completions', async () => {
    // setup — create task with goal and two blocks
    const createRes = await request
      .post('/tasks')
      .send({
        name: 'Running',
        amountUnit: 'minutes',
        goalAmount: 100,
        goalPeriod: 'day-long',
        blocks: [
          { amount: 15, xpReward: 15, coinReward: 10 },
          { amount: 30, xpReward: 30, coinReward: 20 },
        ],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = createRes.body;

    // act — complete both blocks
    await request
      .post('/task-completions')
      .send({ blockId: task.blocks[0].id })
      .expect(201);
    await request
      .post('/task-completions')
      .send({ blockId: task.blocks[1].id })
      .expect(201);

    const res = await request.get('/tasks').expect(200);

    // assert
    const tasks: TaskResponseDto[] = res.body;
    const fetched = tasks.find((t) => t.id === task.id)!;
    expect(fetched.goalCompletedAmount).toBe(45);
    expect(fetched.goalAmount).toBe(100);
  });

  it('goalCompletedAmount - uses client timezone for period boundaries', async () => {
    // A completion at 2026-05-15 03:00 UTC = 2026-05-14 23:00 America/New_York.
    // Reference time: 2026-05-15 12:00 UTC.
    // With UTC: completion is on May 15 -> counts in daily total.
    // With America/New_York: completion is on May 14 -> does NOT count.

    // setup
    const referenceTime = new Date('2026-05-15T12:00:00Z');

    const createRes = await request
      .post('/tasks')
      .send({
        name: 'TZ Task',
        amountUnit: 'minutes',
        goalAmount: 100,
        goalPeriod: 'day-long',
        blocks: [{ amount: 30, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = createRes.body;

    await db.insert(taskCompletions).values({
      userCharacterId: currentUserCharacterId,
      taskId: task.id,
      amount: 30,
      xpEarned: 10,
      coinsEarned: 5,
      completedAt: new Date('2026-05-15T03:00:00Z'),
    });

    // act
    const repo = app.get(TaskCompletionRepository);
    const utcResult = await repo.sumAmountsByTaskIds(
      [task.id],
      'UTC',
      referenceTime,
    );
    const nyResult = await repo.sumAmountsByTaskIds(
      [task.id],
      'America/New_York',
      referenceTime,
    );

    // assert
    expect(utcResult.get(task.id)).toBe(30);
    expect(nyResult.get(task.id)).toBeUndefined();
  });
});
