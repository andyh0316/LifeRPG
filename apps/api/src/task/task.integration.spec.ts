import { INestApplication } from '@nestjs/common';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('Task Integration', () => {
  let app: INestApplication;
  let request: TestAgent;
  let currentUserId: number;
  beforeAll(async () => {
    ({ app, request, currentUserId } = await createIntegrationApp());
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

  it('PATCH /tasks/:id - rejects empty blocks array', async () => {
    // setup
    const setupRes = await request
      .post('/tasks')
      .send({
        name: 'Valid Task',
        blocks: [{ amount: null, xpReward: 10, coinReward: 5 }],
      } as CreateTaskDto)
      .expect(201);

    // act & assert
    await request
      .patch(`/tasks/${setupRes.body.id}`)
      .send({ blocks: [] } as UpdateTaskDto)
      .expect(400);
  });

  it('PATCH /tasks/:id - updates task fields and patches blocks', async () => {
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
      blocks: [
        // blocks[0]: omitted — left untouched
        // blocks[1]: updated
        {
          id: setupTask.blocks[1].id,
          amount: 30,
          xpReward: 30,
          coinReward: 15,
        },
        // blocks[2]: deleted
        { id: setupTask.blocks[2].id, delete: true },
        // new block
        { amount: 90, xpReward: 80, coinReward: 40 },
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
    expect(updatedTask.icon).toBe(updateInput.icon);
    expect(updatedTask.blocks).toHaveLength(3);

    // blocks[0]: untouched — keeps original values
    const untouched = updatedTask.blocks.find(
      (o) => o.id === setupTask.blocks[0].id,
    );
    expect(untouched).toMatchObject({
      amount: 15,
      xpReward: 10,
      coinReward: 5,
    });

    // blocks[1]: updated
    const updated = updatedTask.blocks.find(
      (o) => o.id === setupTask.blocks[1].id,
    );
    expect(updated).toMatchObject({ amount: 30, xpReward: 30, coinReward: 15 });

    // blocks[2]: deleted — no longer present
    const deleted = updatedTask.blocks.find(
      (o) => o.id === setupTask.blocks[2].id,
    );
    expect(deleted).toBeUndefined();

    // new block: gets a fresh id
    const originalIds = setupTask.blocks.map((o) => o.id);
    const created = updatedTask.blocks.find((o) => !originalIds.includes(o.id));
    expect(created).toMatchObject({ amount: 90, xpReward: 80, coinReward: 40 });
  });

  it('GET /tasks/:id - returns a task by id', async () => {
    // setup
    const input: CreateTaskDto = {
      name: 'Stretching',
      desc: 'Morning stretching routine',
      icon: 'yoga',
      blocks: [{ amount: null, xpReward: 15, coinReward: 8 }],
    };
    const createRes = await request.post('/tasks').send(input).expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    // act
    const res = await request.get(`/tasks/${createdTask.id}`).expect(200);

    // assert
    const fetchedTask: TaskResponseDto = res.body;
    expect(fetchedTask.id).toBe(createdTask.id);
    expect(fetchedTask.userId).toBe(currentUserId);
    expect(fetchedTask.name).toBe(input.name);
    expect(fetchedTask.desc).toBe(input.desc);
    expect(fetchedTask.icon).toBe(input.icon);
    expect(fetchedTask.blocks).toHaveLength(1);
  });

  it('GET /tasks - returns all tasks with blocks', async () => {
    // setup
    const input: CreateTaskDto = {
      name: 'Journaling',
      desc: 'Write in journal',
      icon: 'pencil',
      blocks: [
        { amount: null, xpReward: 10, coinReward: 5 },
        { amount: null, xpReward: 20, coinReward: 10 },
      ],
    };
    const createRes = await request.post('/tasks').send(input).expect(201);
    const createdTask: TaskResponseDto = createRes.body;

    // act
    const res = await request.get('/tasks').expect(200);

    // assert
    const tasks: TaskResponseDto[] = res.body;
    expect(tasks.length).toBeGreaterThan(0);
    const found = tasks.find((t) => t.id === createdTask.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe(input.name);
    expect(found!.blocks).toHaveLength(2);
  });
});
