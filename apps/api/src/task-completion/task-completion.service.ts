import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { tasks, taskCompletions, taskOptions, userCharacter } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';

const completionSelect = {
  id: taskCompletions.id,
  taskId: taskCompletions.taskId,
  userId: taskCompletions.userId,
  xpEarned: taskCompletions.xpEarned,
  coinsEarned: taskCompletions.coinsEarned,
  completedAt: taskCompletions.completedAt,
};

@Injectable()
export class TaskCompletionService {
  constructor(@Inject('DATABASE') private db: Db) {}

  // Marks a task as completed for a user. Looks up the task's rewards,
  // records a completion entry, and credits the user's XP and coins—all
  // within a single transaction so rewards stay consistent.
  async complete(
    taskId: number,
    userId: number,
  ): Promise<TaskCompletionResponseDto> {
    return this.db.transaction(async (tx) => {
      // Fetch the task and its first option
      const [task] = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.id, taskId));

      if (!task) {
        throw new NotFoundException(`Task ${taskId} not found`);
      }

      const [option] = await tx
        .select({
          id: taskOptions.id,
          xpReward: taskOptions.xpReward,
          coinReward: taskOptions.coinReward,
        })
        .from(taskOptions)
        .where(eq(taskOptions.taskId, taskId))
        .orderBy(asc(taskOptions.id))
        .limit(1);

      if (!option) {
        throw new NotFoundException(`No task option found for task ${taskId}`);
      }

      // Insert a completion record with the earned rewards
      const [completion] = await tx
        .insert(taskCompletions)
        .values({
          taskId,
          taskOptionId: option.id,
          userId,
          xpEarned: option.xpReward,
          coinsEarned: option.coinReward,
        })
        .returning(completionSelect);

      // Add the task's rewards to the user's character totals
      await tx
        .update(userCharacter)
        .set({
          xp: sql`${userCharacter.xp} + ${option.xpReward}`,
          coins: sql`${userCharacter.coins} + ${option.coinReward}`,
        })
        .where(eq(userCharacter.userId, userId));

      return completion;
    });
  }
}
