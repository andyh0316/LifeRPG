import { users, userCharacter, type Db } from '@life-rpg/database';
import type { TestAgent } from './setup-integration';
import type { CreateTaskDto } from '../src/task/dto/create-task.dto';
import type { TaskResponseDto } from '../src/task/dto/task-response.dto';

const DEFAULT_TASK: CreateTaskDto = {
  name: 'Test Task',
  blocks: [{ amount: 1, xpReward: 10, coinReward: 5 }],
};

export async function createTestTask(
  request: TestAgent,
  overrides?: Partial<CreateTaskDto>,
): Promise<TaskResponseDto> {
  const res = await request
    .post('/tasks')
    .send({ ...DEFAULT_TASK, ...overrides })
    .expect(201);
  return res.body;
}

export async function createTestUser(
  db: Db,
  overrides?: { email?: string; firstName?: string; lastName?: string },
) {
  const [row] = await db
    .insert(users)
    .values({ email: 'other@test.com', firstName: 'Other', ...overrides })
    .returning();
  return row;
}

export async function createTestCharacter(
  db: Db,
  userId: number,
  overrides?: { name?: string },
) {
  const [row] = await db
    .insert(userCharacter)
    .values({ userId, name: '', ...overrides })
    .returning();
  return row;
}
