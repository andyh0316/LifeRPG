import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { userCharacterSettings, taskCompletions } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { GoalsResponseDto } from './dto/goals-response.dto';
import { GoalsProgressResponseDto } from './dto/goals-progress-response.dto';

const goalsSelect = {
  id: userCharacterSettings.id,
  userId: userCharacterSettings.userId,
  dailyXpTarget: userCharacterSettings.dailyXpTarget,
  weeklyXpTarget: userCharacterSettings.weeklyXpTarget,
  monthlyXpTarget: userCharacterSettings.monthlyXpTarget,
  quarterlyXpTarget: userCharacterSettings.quarterlyXpTarget,
  yearlyXpTarget: userCharacterSettings.yearlyXpTarget,
};

@Injectable()
export class UserCharacterService {
  constructor(@Inject('DATABASE') private db: Db) {}

  async getGoals(userId: number): Promise<GoalsResponseDto | null> {
    const [row] = await this.db
      .select(goalsSelect)
      .from(userCharacterSettings)
      .where(eq(userCharacterSettings.userId, userId));

    return row ?? null;
  }

  async updateGoals(
    userId: number,
    dto: UpdateGoalsDto,
  ): Promise<GoalsResponseDto> {
    const [row] = await this.db
      .insert(userCharacterSettings)
      .values({ userId, ...dto })
      .onConflictDoUpdate({
        target: userCharacterSettings.userId,
        set: dto,
      })
      .returning(goalsSelect);

    return row;
  }

  // Fetches the user's XP targets and computes actual XP earned for each
  // time period (daily, weekly, monthly, quarterly, yearly) by summing
  // task completions that fall within each period's window.
  async getGoalsProgress(
    userId: number,
    referenceTime: Date = new Date(),
  ): Promise<GoalsProgressResponseDto> {
    const goals = await this.getGoals(userId);
    const ref = sql`${referenceTime.toISOString()}::timestamptz`;

    const [xpRow] = await this.db
      .select({
        dailyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('day', ${ref}) then ${taskCompletions.xpEarned} else 0 end), 0)`,
        weeklyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('week', ${ref}) then ${taskCompletions.xpEarned} else 0 end), 0)`,
        monthlyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('month', ${ref}) then ${taskCompletions.xpEarned} else 0 end), 0)`,
        quarterlyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('quarter', ${ref}) then ${taskCompletions.xpEarned} else 0 end), 0)`,
        yearlyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('year', ${ref}) then ${taskCompletions.xpEarned} else 0 end), 0)`,
      })
      .from(taskCompletions)
      .where(
        sql`${taskCompletions.userId} = ${userId} and ${taskCompletions.completedAt} >= date_trunc('year', ${ref})`,
      );

    return {
      daily: {
        target: goals?.dailyXpTarget ?? null,
        current: Number(xpRow.dailyXp),
      },
      weekly: {
        target: goals?.weeklyXpTarget ?? null,
        current: Number(xpRow.weeklyXp),
      },
      monthly: {
        target: goals?.monthlyXpTarget ?? null,
        current: Number(xpRow.monthlyXp),
      },
      quarterly: {
        target: goals?.quarterlyXpTarget ?? null,
        current: Number(xpRow.quarterlyXp),
      },
      yearly: {
        target: goals?.yearlyXpTarget ?? null,
        current: Number(xpRow.yearlyXp),
      },
    };
  }
}
