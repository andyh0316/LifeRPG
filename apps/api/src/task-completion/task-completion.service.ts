import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { tasks, taskCompletions, userCharacter } from '@life-rpg/database';
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

      // Add the task's rewards to the user's character totals
      await tx
        .update(userCharacter)
        .set({
          xp: sql`${userCharacter.xp} + ${task.xpReward}`,
          coins: sql`${userCharacter.coins} + ${task.coinReward}`,
        })
        .where(eq(userCharacter.userId, userId));

      return completion;
    });
  }
}
