import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { tasks, taskCompletions, users } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';

const taskSelect = {
  id: tasks.id,
  name: tasks.name,
  description: tasks.description,
  xpReward: tasks.xpReward,
  coinReward: tasks.coinReward,
  icon: tasks.icon,
};

const completionSelect = {
  id: taskCompletions.id,
  taskId: taskCompletions.taskId,
  userId: taskCompletions.userId,
  xpEarned: taskCompletions.xpEarned,
  coinsEarned: taskCompletions.coinsEarned,
  completedAt: taskCompletions.completedAt,
};

@Injectable()
export class TaskService {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findAll(): Promise<TaskResponseDto[]> {
    return this.db.select(taskSelect).from(tasks);
  }

  // Marks a task as completed for a user. Looks up the task's rewards,
  // records a completion entry, and credits the user's XP and coins—all
  // within a single transaction so rewards stay consistent.
  async complete(
    taskId: number,
    userId: string,
  ): Promise<TaskCompletionResponseDto> {
    return this.db.transaction(async (tx) => {
      // Fetch the task's XP and coin rewards
      const [task] = await tx
        .select({ xpReward: tasks.xpReward, coinReward: tasks.coinReward })
        .from(tasks)
        .where(eq(tasks.id, taskId));

      if (!task) {
        throw new NotFoundException(`Task ${taskId} not found`);
      }

      // Insert a completion record with the earned rewards
      const [completion] = await tx
        .insert(taskCompletions)
        .values({
          taskId,
          userId,
          xpEarned: task.xpReward,
          coinsEarned: task.coinReward,
        })
        .returning(completionSelect);

      // Add the task's rewards to the user's totals
      await tx
        .update(users)
        .set({
          xp: sql`${users.xp} + ${task.xpReward}`,
          coins: sql`${users.coins} + ${task.coinReward}`,
        })
        .where(eq(users.id, userId));

      return completion;
    });
  }
}
