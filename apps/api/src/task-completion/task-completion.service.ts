import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import {
  tasks,
  taskCompletions,
  taskBlocks,
  userCharacter,
} from '@life-rpg/database';
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
      // Fetch the task and its first block
      const [task] = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.id, taskId));

      if (!task) {
        throw new NotFoundException(`Task ${taskId} not found`);
      }

      const [block] = await tx
        .select({
          amount: taskBlocks.amount,
          xpReward: taskBlocks.xpReward,
          coinReward: taskBlocks.coinReward,
        })
        .from(taskBlocks)
        .where(eq(taskBlocks.taskId, taskId))
        .orderBy(asc(taskBlocks.id))
        .limit(1);

      if (!block) {
        throw new NotFoundException(`No task block found for task ${taskId}`);
      }

      // Insert a completion record with the earned rewards
      const [completion] = await tx
        .insert(taskCompletions)
        .values({
          taskId,
          amount: block.amount,
          userId,
          xpEarned: block.xpReward,
          coinsEarned: block.coinReward,
        })
        .returning(completionSelect);

      // Add the task's rewards to the user's character totals
      await tx
        .update(userCharacter)
        .set({
          xp: sql`${userCharacter.xp} + ${block.xpReward}`,
          coins: sql`${userCharacter.coins} + ${block.coinReward}`,
        })
        .where(eq(userCharacter.userId, userId));

      return completion;
    });
  }
}
