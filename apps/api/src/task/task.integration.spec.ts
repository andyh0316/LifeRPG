import { INestApplication } from '@nestjs/common';
import { tasks } from '@life-rpg/database/schema';
import { createDb } from '@life-rpg/database';
import { ApiClient, createIntegrationApp } from '../test/setup-integration';

describe('Task Integration', () => {
  let app: INestApplication;
  let db: ReturnType<typeof createDb>;
  let client: ApiClient;
  let testTaskId: number;
  let testUserId: string;

  beforeAll(async () => {
    // Bootstrap the shared integration app and typed client
    ({ app, db, client } = await createIntegrationApp());

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

    // Create a test user via the typed client
    const uniqueEmail = `task-integration-${Date.now()}@example.com`;
    const { data: user, error } = await client.POST('/users', {
      body: {
        email: uniqueEmail,
        firstName: 'Task',
        lastName: 'Tester',
        displayName: 'TaskTester',
      },
    });
    if (error) throw new Error(`Failed to create test user: ${JSON.stringify(error)}`);
    testUserId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tasks — returns the test task with expected fields', async () => {
    const { data: taskList, error } = await client.GET('/tasks');

    // Verify no error
    expect(error).toBeUndefined();

    // Find our test task in the response
    const found = taskList!.find((t) => t.id === testTaskId);

    expect(found).toBeDefined();
    expect(found!.id).toBe(testTaskId);
    expect(found!.name).toBe('Integration Test Task');
    expect(found!.description).toBe('Task created for integration tests');
    expect(found!.xpReward).toBe(50);
    expect(found!.coinReward).toBe(10);
    expect(found!.icon).toBe('test_icon');
  });

  it('POST /tasks/:id/complete — completes the task and returns correct response', async () => {
    const { data: completion, error } = await client.POST(
      '/tasks/{id}/complete',
      {
        params: { path: { id: testTaskId } },
        body: { userId: testUserId },
      },
    );

    // Verify no error and response shape
    expect(error).toBeUndefined();
    expect(completion!.taskId).toBe(testTaskId);
    expect(completion!.userId).toBe(testUserId);
    expect(completion!.xpEarned).toBe(50);
    expect(completion!.coinsEarned).toBe(10);
    expect(completion!.completedAt).toBeDefined();
  });

  it('POST /tasks/:id/complete — returns error for invalid task ID', async () => {
    const { error } = await client.POST('/tasks/{id}/complete', {
      params: { path: { id: 999999 } },
      body: { userId: testUserId },
    });

    expect(error).toBeDefined();
  });

  it('POST /tasks/:id/complete — returns error for invalid userId', async () => {
    const { error } = await client.POST('/tasks/{id}/complete', {
      params: { path: { id: testTaskId } },
      body: { userId: 'not-a-uuid' },
    });

    expect(error).toBeDefined();
  });
});
