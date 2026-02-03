import { INestApplication } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';

describe('Task Integration', () => {
  let app: INestApplication;
  let db: Db;
  let request: TestAgent;

  beforeAll(async () => {
    ({ app, db, request } = await createIntegrationApp());
  });

  afterAll(async () => {
    await app.close();
  });

  // Shared request createTaskInput used across tests
  const createTaskInput: CreateTaskDto = {
    name: 'Test Task',
    desc: 'A test task description',
    xpReward: 10,
    coinReward: 5,
    icon: 'sword',
  };

  let createdTaskId: number;

  /** Verifies that POST /tasks creates a task and returns the correct shape. */
  it('POST /tasks - creates a task', async () => {
    const res = await request.post('/tasks').send(createTaskInput).expect(201);

    const task: TaskResponseDto = res.body;
    expect(task.id).toBeDefined();
    createdTaskId = task.id;
    expect(task.name).toBe(createTaskInput.name);
    expect(task.xpReward).toBe(createTaskInput.xpReward);
    expect(task.coinReward).toBe(createTaskInput.coinReward);
    expect(task.desc).toBe(createTaskInput.desc);
    expect(task.icon).toBe(createTaskInput.icon);
  });

  /** Verifies that GET /tasks/:id returns the previously created task. */
  it('GET /tasks/:id - finds a task by id', async () => {
    const res = await request.get(`/tasks/${createdTaskId}`).expect(200);

    const found: TaskResponseDto = res.body;
    expect(found.id).toBe(createdTaskId);
    expect(found.name).toBe(createTaskInput.name);
    expect(found.desc).toBe(createTaskInput.desc);
    expect(found.xpReward).toBe(createTaskInput.xpReward);
    expect(found.coinReward).toBe(createTaskInput.coinReward);
    expect(found.icon).toBe(createTaskInput.icon);
  });

  /** Verifies that PATCH /tasks/:id updates every field. */
  it('PATCH /tasks/:id - updates every field', async () => {
    const updateInput = {
      name: 'Updated Task',
      desc: 'Updated description',
      xpReward: 99,
      coinReward: 50,
      icon: 'shield',
    };

    const res = await request
      .patch(`/tasks/${createdTaskId}`)
      .send(updateInput)
      .expect(200);

    const task: TaskResponseDto = res.body;
    expect(task.id).toBe(createdTaskId);
    expect(task.name).toBe(updateInput.name);
    expect(task.desc).toBe(updateInput.desc);
    expect(task.xpReward).toBe(updateInput.xpReward);
    expect(task.coinReward).toBe(updateInput.coinReward);
    expect(task.icon).toBe(updateInput.icon);
  });

  /** Verifies that PATCH with undefined fields (empty body) leaves all fields unchanged. */
  // it('PATCH /tasks/:id - undefined fields are not updated', async () => {
  //   const res = await request
  //     .patch(`/tasks/${createdTaskId}`)
  //     .send({})
  //     .expect(200);

  //   const task: TaskResponseDto = res.body;
  //   expect(task.id).toBe(createdTaskId);
  //   expect(task.name).toBe('Updated Task');
  //   expect(task.desc).toBe('Updated description');
  //   expect(task.xpReward).toBe(99);
  //   expect(task.coinReward).toBe(50);
  //   expect(task.icon).toBe('shield');
  // });

  /** Verifies that PATCH with null clears nullable fields; non-nullable fields reject null. */
  // it('PATCH /tasks/:id - null clears nullable fields', async () => {
  //   const res = await request
  //     .patch(`/tasks/${createdTaskId}`)
  //     .send({ desc: null, icon: null })
  //     .expect(200);

  //   const task: TaskResponseDto = res.body;
  //   expect(task.id).toBe(createdTaskId);
  //   expect(task.desc).toBeNull();
  //   expect(task.icon).toBeNull();
  //   // Non-nullable fields remain unchanged
  //   expect(task.name).toBe('Updated Task');
  //   expect(task.xpReward).toBe(99);
  //   expect(task.coinReward).toBe(50);
  // });
});
