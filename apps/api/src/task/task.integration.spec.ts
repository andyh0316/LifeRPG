import { INestApplication } from '@nestjs/common';
import { tasks } from '@life-rpg/database/schema';
import type { Db } from '@life-rpg/database';
import { ApiClient, createIntegrationApp } from '../test/setup-integration';

describe('Task Integration', () => {
  let app: INestApplication;
  let db: Db;
  let client: ApiClient;
  let testTaskId: number;

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
});
