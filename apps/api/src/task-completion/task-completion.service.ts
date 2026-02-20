import {
  Inject,
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, sql, and } from 'drizzle-orm';
import { tasks, taskCompletions, taskBlocks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { UserCharacterService } from '../user-character/user-character.service';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';
import { WeeklyTrackerTaskDto } from './dto/weekly-tracker-response.dto';

const completionSelect = {
  id: taskCompletions.id,
  taskId: taskCompletions.taskId,
  userCharacterId: taskCompletions.userCharacterId,
  xpEarned: taskCompletions.xpEarned,
  coinsEarned: taskCompletions.coinsEarned,
  completedAt: taskCompletions.completedAt,
};

@Injectable()
export class TaskCompletionService {
  constructor(
    @Inject('DATABASE') private db: Db,
    private userCharacterService: UserCharacterService,
  ) {}

  async findAll(userCharacterId: number): Promise<TaskCompletionResponseDto[]> {
    return this.db
      .select(completionSelect)
      .from(taskCompletions)
      .where(eq(taskCompletions.userCharacterId, userCharacterId))
      .orderBy(desc(taskCompletions.completedAt));
  }

  // Marks a task block as completed for a user. Looks up the block's rewards,
  // records a completion entry, and credits the user's XP and coins—all
  // within a single transaction so rewards stay consistent.
  async getWeeklyTracker(
    _userCharacterId: number,
    _weekStart: string,
  ): Promise<WeeklyTrackerTaskDto[]> {
    // TODO: query completions grouped by task + day, build dailyTotals
    return [];
  }

  async complete(
    blockId: number,
    userCharacterId: number,
    completedAt: Date,
  ): Promise<TaskCompletionResponseDto> {
    return this.db.transaction(async (tx) => {
      const [block] = await tx
        .select({
          taskId: taskBlocks.taskId,
          amount: taskBlocks.amount,
          xpReward: taskBlocks.xpReward,
          coinReward: taskBlocks.coinReward,
        })
        .from(taskBlocks)
        .where(eq(taskBlocks.id, blockId));

      if (!block) {
        throw new NotFoundException(`Task block ${blockId} not found`);
      }

      const [task] = await tx
        .select({
          userCharacterId: tasks.userCharacterId,
        })
        .from(tasks)
        .where(eq(tasks.id, block.taskId));

      if (task.userCharacterId !== userCharacterId) {
        throw new ForbiddenException('Task does not belong to this user');
      }

      // Insert a completion record with the earned rewards
      const [completion] = await tx
        .insert(taskCompletions)
        .values({
          taskId: block.taskId,
          amount: block.amount,
          userCharacterId,
          xpEarned: block.xpReward,
          coinsEarned: block.coinReward,
          completedAt,
        })
        .returning(completionSelect);

      // Add the block's rewards to the user's character totals
      await this.userCharacterService.addXp(
        userCharacterId,
        block.xpReward,
        block.coinReward,
        tx,
      );

      return completion;
    });
  }

  async undoLast(userCharacterId: number): Promise<TaskCompletionResponseDto> {
    const [latest] = await this.db
      .select(completionSelect)
      .from(taskCompletions)
      .where(eq(taskCompletions.userCharacterId, userCharacterId))
      .orderBy(desc(taskCompletions.id))
      .limit(1);

    if (!latest) {
      throw new NotFoundException('No completions to undo');
    }

    const ageMs = Date.now() - new Date(latest.completedAt).getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'Cannot undo completions older than 24 hours',
      );
    }

    return this.db.transaction(async (tx) => {
      await tx.delete(taskCompletions).where(eq(taskCompletions.id, latest.id));

      await this.userCharacterService.addXp(
        userCharacterId,
        -latest.xpEarned,
        -latest.coinsEarned,
        tx,
      );

      return latest;
    });
  }
}
