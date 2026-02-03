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
    description: 'A test task description',
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
    expect(task.description).toBe(createTaskInput.description);
    expect(task.icon).toBe(createTaskInput.icon);
  });

  /** Verifies that GET /tasks/:id returns the previously created task. */
  it('GET /tasks/:id - finds a task by id', async () => {
    const res = await request.get(`/tasks/${createdTaskId}`).expect(200);

    const found: TaskResponseDto = res.body;
    expect(found.id).toBe(createdTaskId);
    expect(found.name).toBe(createTaskInput.name);
    expect(found.description).toBe(createTaskInput.description);
    expect(found.xpReward).toBe(createTaskInput.xpReward);
    expect(found.coinReward).toBe(createTaskInput.coinReward);
    expect(found.icon).toBe(createTaskInput.icon);
  });
});
