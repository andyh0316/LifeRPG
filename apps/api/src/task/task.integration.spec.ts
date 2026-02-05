import type { Db } from '@life-rpg/database';
import { users } from '@life-rpg/database';
import { INestApplication } from '@nestjs/common';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('Task Integration', () => {
  let app: INestApplication;
  let db: Db;
  let request: TestAgent;
  let testUserId: number;

  beforeAll(async () => {
    ({ app, db, request } = await createIntegrationApp());

    // Create a test user directly in the database
    const [user] = await db
      .insert(users)
      .values({
        email: 'tasktest@example.com',
        firstName: 'Task',
        lastName: 'Tester',
      })
      .returning({ id: users.id });
    testUserId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tasks/:id - returns a task by id', async () => {
    // setup
    const input: CreateTaskDto = {
      userId: testUserId,
      name: 'Stretching',
      desc: 'Morning stretching routine',
      xpReward: 15,
      coinReward: 8,
      icon: 'yoga',
    };
    const createRes = await request.post('/tasks').send(input).expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    // act
    const res = await request.get(`/tasks/${createdTask.id}`).expect(200);

    // assert
    const fetchedTask: TaskResponseDto = res.body;
    expect(fetchedTask.id).toBe(createdTask.id);
    expect(fetchedTask.userId).toBe(testUserId);
    expect(fetchedTask.name).toBe(input.name);
    expect(fetchedTask.desc).toBe(input.desc);
    expect(fetchedTask.xpReward).toBe(input.xpReward);
    expect(fetchedTask.coinReward).toBe(input.coinReward);
    expect(fetchedTask.icon).toBe(input.icon);
  });

  it('POST /tasks - creates a task without options', async () => {
    // setup
    const input: CreateTaskDto = {
      userId: testUserId,
      name: 'Push-ups',
      desc: 'Do some push-ups',
      xpReward: 10,
      coinReward: 5,
      icon: 'muscle',
    };

    // act
    const res = await request.post('/tasks').send(input).expect(201);

    // assert
    const task: TaskResponseDto = res.body;
    expect(task.id).toBeDefined();
    expect(task.name).toBe(input.name);
    expect(task.xpReward).toBe(10);
    expect(task.coinReward).toBe(5);
    expect(task.goalUnit).toBeNull();
    expect(task.options).toHaveLength(1);
    expect(task.options[0]).toMatchObject({
      goal: null,
      xpReward: 10,
      coinReward: 5,
    });
  });

  it('POST /tasks - creates a task with options', async () => {
    // setup
    const input: CreateTaskDto = {
      userId: testUserId,
      name: 'Meditate',
      desc: 'Daily meditation',
      icon: 'lotus',
      goalUnit: 'minutes',
      options: [
        { goal: 15, xpReward: 10, coinReward: 5 },
        { goal: 30, xpReward: 25, coinReward: 12 },
        { goal: 60, xpReward: 50, coinReward: 25 },
      ],
    };

    // act
    const res = await request.post('/tasks').send(input).expect(201);

    // assert
    const task: TaskResponseDto = res.body;
    expect(task.id).toBeDefined();
    expect(task.name).toBe(input.name);
    expect(task.goalUnit).toBe('minutes');
    expect(task.options).toHaveLength(3);
    expect(task.options[0]).toMatchObject({
      goal: 15,
      xpReward: 10,
      coinReward: 5,
    });
    expect(task.options[1]).toMatchObject({
      goal: 30,
      xpReward: 25,
      coinReward: 12,
    });
    expect(task.options[2]).toMatchObject({
      goal: 60,
      xpReward: 50,
      coinReward: 25,
    });
  });

  it('POST /tasks - rejects empty options array', async () => {
    await request
      .post('/tasks')
      .send({
        userId: testUserId,
        name: 'Bad Task',
        xpReward: 10,
        coinReward: 5,
        options: [],
      } as CreateTaskDto)
      .expect(400);
  });

  it('PATCH /tasks/:id - rejects empty options array', async () => {
    // setup
    const setupRes = await request
      .post('/tasks')
      .send({
        userId: testUserId,
        name: 'Valid Task',
        xpReward: 10,
        coinReward: 5,
      } as CreateTaskDto)
      .expect(201);

    // act & assert
    await request
      .patch(`/tasks/${setupRes.body.id}`)
      .send({ options: [] } as UpdateTaskDto)
      .expect(400);
  });

  it('PATCH /tasks/:id - updates task fields and patches options', async () => {
    // setup — create task with 3 options
    const setupRes = await request
      .post('/tasks')
      .send({
        userId: testUserId,
        name: 'Read',
        desc: 'Read a book',
        xpReward: 10,
        coinReward: 5,
        icon: 'book',
        goalUnit: 'minutes',
        options: [
          { goal: 15, xpReward: 10, coinReward: 5 },
          { goal: 30, xpReward: 25, coinReward: 12 },
          { goal: 60, xpReward: 50, coinReward: 25 },
        ],
      } as CreateTaskDto)
      .expect(201);
    const setupTask: TaskResponseDto = setupRes.body;

    const updateInput: UpdateTaskDto = {
      name: 'Read More',
      desc: 'Read two chapters',
      xpReward: 20,
      coinReward: 10,
      icon: 'books',
      options: [
        // option[0]: omitted — left untouched
        // option[1]: updated
        { id: setupTask.options[1].id, goal: 30, xpReward: 30, coinReward: 15 },
        // option[2]: deleted
        { id: setupTask.options[2].id, delete: true },
        // new option
        { goal: 90, xpReward: 80, coinReward: 40 },
      ],
    };

    // act
    const res = await request
      .patch(`/tasks/${setupTask.id}`)
      .send(updateInput)
      .expect(200);

    // assert
    const updatedTask: TaskResponseDto = res.body;
    expect(updatedTask.id).toBe(setupTask.id);
    expect(updatedTask.name).toBe(updateInput.name);
    expect(updatedTask.desc).toBe(updateInput.desc);
    expect(updatedTask.xpReward).toBe(updateInput.xpReward);
    expect(updatedTask.coinReward).toBe(updateInput.coinReward);
    expect(updatedTask.icon).toBe(updateInput.icon);
    expect(updatedTask.options).toHaveLength(3);

    // option[0]: untouched — keeps original values
    const untouched = updatedTask.options.find(
      (o) => o.id === setupTask.options[0].id,
    );
    expect(untouched).toMatchObject({ goal: 15, xpReward: 10, coinReward: 5 });

    // option[1]: updated
    const updated = updatedTask.options.find(
      (o) => o.id === setupTask.options[1].id,
    );
    expect(updated).toMatchObject({ goal: 30, xpReward: 30, coinReward: 15 });

    // option[2]: deleted — no longer present
    const deleted = updatedTask.options.find(
      (o) => o.id === setupTask.options[2].id,
    );
    expect(deleted).toBeUndefined();

    // new option: gets a fresh id
    const originalIds = setupTask.options.map((o) => o.id);
    const created = updatedTask.options.find(
      (o) => !originalIds.includes(o.id),
    );
    expect(created).toMatchObject({ goal: 90, xpReward: 80, coinReward: 40 });
  });
});
