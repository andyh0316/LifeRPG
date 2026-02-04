import { INestApplication } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { users } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';

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

  it('PATCH /tasks/:id - updates task fields', async () => {
    // setup
    const createRes = await request
      .post('/tasks')
      .send({
        userId: testUserId,
        name: 'Read',
        desc: 'Read a book',
        xpReward: 10,
        coinReward: 5,
        icon: 'book',
      } as CreateTaskDto)
      .expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    const updateInput: UpdateTaskDto = {
      name: 'Read More',
      desc: 'Read two chapters',
      xpReward: 20,
      coinReward: 10,
      icon: 'books',
    };

    // act
    const res = await request
      .patch(`/tasks/${createdTask.id}`)
      .send(updateInput)
      .expect(200);

    // assert
    const updatedTask: TaskResponseDto = res.body;
    expect(updatedTask.id).toBe(createdTask.id);
    expect(updatedTask.name).toBe(updateInput.name);
    expect(updatedTask.desc).toBe(updateInput.desc);
    expect(updatedTask.xpReward).toBe(updateInput.xpReward);
    expect(updatedTask.coinReward).toBe(updateInput.coinReward);
    expect(updatedTask.icon).toBe(updateInput.icon);
  });

  it('PATCH /tasks/:id - omitted fields are not changed', async () => {
    // setup
    const createRes = await request
      .post('/tasks')
      .send({
        userId: testUserId,
        name: 'Journal',
        desc: 'Write in journal',
        xpReward: 15,
        coinReward: 7,
        icon: 'pencil',
      } as CreateTaskDto)
      .expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    // act
    const res = await request
      .patch(`/tasks/${createdTask.id}`)
      .send({})
      .expect(200);

    // assert
    const updatedTask: TaskResponseDto = res.body;
    expect(updatedTask.id).toBe(createdTask.id);
    expect(updatedTask.name).toBe('Journal');
    expect(updatedTask.desc).toBe('Write in journal');
    expect(updatedTask.xpReward).toBe(15);
    expect(updatedTask.coinReward).toBe(7);
    expect(updatedTask.icon).toBe('pencil');
  });

  it('PATCH /tasks/:id - null clears nullable fields', async () => {
    // setup
    const createRes = await request
      .post('/tasks')
      .send({
        userId: testUserId,
        name: 'Walk',
        desc: 'Take a walk',
        xpReward: 5,
        coinReward: 3,
        icon: 'shoe',
      } as CreateTaskDto)
      .expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    // act
    const res = await request
      .patch(`/tasks/${createdTask.id}`)
      .send({ desc: null, icon: null } as UpdateTaskDto)
      .expect(200);

    // assert
    const updatedTask: TaskResponseDto = res.body;
    expect(updatedTask.id).toBe(createdTask.id);
    expect(updatedTask.desc).toBeNull();
    expect(updatedTask.icon).toBeNull();
    expect(updatedTask.name).toBe('Walk');
    expect(updatedTask.xpReward).toBe(5);
    expect(updatedTask.coinReward).toBe(3);
  });

  it('PATCH /tasks/:id - replaces options', async () => {
    // setup
    const createRes = await request
      .post('/tasks')
      .send({
        userId: testUserId,
        name: 'Run',
        icon: 'runner',
        goalUnit: 'minutes',
        options: [
          { goal: 10, xpReward: 5, coinReward: 2 },
          { goal: 20, xpReward: 10, coinReward: 5 },
        ],
      } as CreateTaskDto)
      .expect(201);
    const createdTask: TaskResponseDto = createRes.body;
    expect(createdTask.options).toHaveLength(2);

    // act
    const res = await request
      .patch(`/tasks/${createdTask.id}`)
      .send({
        options: [
          { goal: 30, xpReward: 20, coinReward: 10 },
          { goal: 60, xpReward: 50, coinReward: 25 },
          { goal: 90, xpReward: 80, coinReward: 40 },
        ],
      } as UpdateTaskDto)
      .expect(200);

    // assert
    const updatedTask: TaskResponseDto = res.body;
    expect(updatedTask.options).toHaveLength(3);
    expect(updatedTask.options[0]).toMatchObject({
      goal: 30,
      xpReward: 20,
      coinReward: 10,
    });
    expect(updatedTask.options[1]).toMatchObject({
      goal: 60,
      xpReward: 50,
      coinReward: 25,
    });
    expect(updatedTask.options[2]).toMatchObject({
      goal: 90,
      xpReward: 80,
      coinReward: 40,
    });
  });
});
