import { INestApplication } from '@nestjs/common';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { CreateTaskDto } from '../task/dto/create-task.dto';
import { TaskResponseDto } from '../task/dto/task-response.dto';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';

describe('Task Completion Integration', () => {
  let app: INestApplication;
  let request: TestAgent;
  let currentUserId: number;
  beforeAll(async () => {
    ({ app, request, currentUserId } = await createIntegrationApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /task-completions - completes a block and returns earned rewards', async () => {
    // setup
    const createRes = await request
      .post('/tasks')
      .send({
        name: 'Push-ups',
        desc: 'Do 20 push-ups',
        icon: 'muscle',
        blocks: [{ amount: null, xpReward: 15, coinReward: 10 }],
      } as CreateTaskDto)
      .expect(201);
    const task: TaskResponseDto = createRes.body;

    // act
    const res = await request
      .post('/task-completions')
      .send({ blockId: task.blocks[0].id })
      .expect(201);

    // assert
    const completion: TaskCompletionResponseDto = res.body;
    expect(completion.id).toBeDefined();
    expect(completion.taskId).toBe(task.id);
    expect(completion.userId).toBe(currentUserId);
    expect(completion.xpEarned).toBe(15);
    expect(completion.coinsEarned).toBe(10);
    expect(completion.completedAt).toBeDefined();
  });

  it('POST /task-completions - each block returns its own rewards', async () => {
    // setup
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

    // act
    const res1 = await request
      .post('/task-completions')
      .send({ blockId: task.blocks[0].id })
      .expect(201);
    const res2 = await request
      .post('/task-completions')
      .send({ blockId: task.blocks[1].id })
      .expect(201);

    // assert
    const c1: TaskCompletionResponseDto = res1.body;
    expect(c1.xpEarned).toBe(10);
    expect(c1.coinsEarned).toBe(5);

    const c2: TaskCompletionResponseDto = res2.body;
    expect(c2.xpEarned).toBe(25);
    expect(c2.coinsEarned).toBe(12);
  });
});
