import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { tasks } from '@life-rpg/database/schema';
import { createDb } from '@life-rpg/database';
import { createIntegrationApp } from '../test/setup-integration';

describe('Task Integration', () => {
  let app: INestApplication;
  let db: ReturnType<typeof createDb>;
  let testTaskId: number;
  let testUserId: string;

  beforeAll(async () => {
    // Bootstrap the shared integration app
    ({ app, db } = await createIntegrationApp());

    // Insert a test task directly via Drizzle
    const [testTask] = await db
      .insert(tasks)
      .values({
        name: 'Integration Test Task',
        description: 'Task created for integration tests',
        xpReward: 50,
        coinReward: 10,
        icon: 'test_icon',
      })
      .returning();
    testTaskId = testTask.id;

    // Create a test user via the API
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'task-integration-test@example.com',
        firstName: 'Task',
        lastName: 'Tester',
        displayName: 'TaskTester',
      })
      .expect(201);
    testUserId = createRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tasks — returns the test task with expected fields', async () => {
    const res = await request(app.getHttpServer()).get('/tasks').expect(200);

    // Find our test task in the response
    const found = res.body.find(
      (t: { id: number }) => t.id === testTaskId,
    );

    expect(found).toBeDefined();
    expect(found).toHaveProperty('id', testTaskId);
    expect(found).toHaveProperty('name', 'Integration Test Task');
    expect(found).toHaveProperty(
      'description',
      'Task created for integration tests',
    );
    expect(found).toHaveProperty('xpReward', 50);
    expect(found).toHaveProperty('coinReward', 10);
    expect(found).toHaveProperty('icon', 'test_icon');
  });

  it('POST /tasks/:id/complete — completes the task and returns correct response', async () => {
    const res = await request(app.getHttpServer())
      .post(`/tasks/${testTaskId}/complete`)
      .send({ userId: testUserId })
      .expect(201);

    // Verify the completion response shape and values
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('taskId', testTaskId);
    expect(res.body).toHaveProperty('userId', testUserId);
    expect(res.body).toHaveProperty('xpEarned', 50);
    expect(res.body).toHaveProperty('coinsEarned', 10);
    expect(res.body).toHaveProperty('completedAt');
  });

  it('POST /tasks/:id/complete — returns 404 for invalid task ID', async () => {
    await request(app.getHttpServer())
      .post('/tasks/999999/complete')
      .send({ userId: testUserId })
      .expect(404);
  });

  it('POST /tasks/:id/complete — returns 400 for invalid userId', async () => {
    await request(app.getHttpServer())
      .post(`/tasks/${testTaskId}/complete`)
      .send({ userId: 'not-a-uuid' })
      .expect(400);
  });
});
