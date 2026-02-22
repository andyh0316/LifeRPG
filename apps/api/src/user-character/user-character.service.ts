import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import {
  userCharacter,
  userCharacterSettings,
  taskCompletions,
} from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { GoalsResponseDto } from './dto/goals-response.dto';
import { GoalsProgressResponseDto } from './dto/goals-progress-response.dto';
import { levelFromXp } from './leveling';

const goalsSelect = {
  id: userCharacterSettings.id,
  userCharacterId: userCharacterSettings.userCharacterId,
  dailyXpTarget: userCharacterSettings.dailyXpTarget,
  weeklyXpTarget: userCharacterSettings.weeklyXpTarget,
  monthlyXpTarget: userCharacterSettings.monthlyXpTarget,
  quarterlyXpTarget: userCharacterSettings.quarterlyXpTarget,
  yearlyXpTarget: userCharacterSettings.yearlyXpTarget,
};

@Injectable()
export class UserCharacterService {
  constructor(@Inject('DATABASE') private db: Db) {}

  async getCharacters(
    userId: number,
  ): Promise<
    { id: number; name: string; level: number; xp: number; coins: number }[]
  > {
    return this.db
      .select({
        id: userCharacter.id,
        name: userCharacter.name,
        level: userCharacter.level,
        xp: userCharacter.xp,
        coins: userCharacter.coins,
      })
      .from(userCharacter)
      .where(eq(userCharacter.userId, userId))
      .orderBy(asc(userCharacter.id));
  }

  async addXp(
    userCharacterId: number,
    xpDelta: number,
    coinsDelta: number,
    tx: Db = this.db,
  ): Promise<void> {
    const [row] = await tx
      .select({ xp: userCharacter.xp })
      .from(userCharacter)
      .where(eq(userCharacter.id, userCharacterId));

    const newXp = row.xp + xpDelta;

    await tx
      .update(userCharacter)
      .set({
        xp: newXp,
        level: levelFromXp(newXp),
        coins: sql`${userCharacter.coins} + ${coinsDelta}`,
      })
      .where(eq(userCharacter.id, userCharacterId));
  }

  async getGoals(userCharacterId: number): Promise<GoalsResponseDto | null> {
    const [row] = await this.db
      .select(goalsSelect)
      .from(userCharacterSettings)
      .where(eq(userCharacterSettings.userCharacterId, userCharacterId));

    return row ?? null;
  }

  async updateGoals(
    userCharacterId: number,
    dto: UpdateGoalsDto,
  ): Promise<GoalsResponseDto> {
    const [row] = await this.db
      .insert(userCharacterSettings)
      .values({ userCharacterId, ...dto })
      .onConflictDoUpdate({
        target: userCharacterSettings.userCharacterId,
        set: dto,
      })
      .returning(goalsSelect);

    return row;
  }

  // Fetches the user's XP targets and computes actual XP earned for each
  // time period (daily, weekly, monthly, quarterly, yearly) by summing
  // task completions that fall within each period's window.
  async getGoalsProgress(
    userCharacterId: number,
    forDate: string = new Date().toLocaleDateString('en-CA'),
    timezone: string = 'UTC',
  ): Promise<GoalsProgressResponseDto> {
    const goals = await this.getGoals(userCharacterId);
    const ref = sql`(${forDate}::date)::timestamp AT TIME ZONE ${timezone}`;
    const tz = sql`${timezone}`;

    const [xpRow] = await this.db
      .select({
        dailyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= ${ref} then ${taskCompletions.xpEarned} else 0 end), 0)`,
        weeklyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('week', ${forDate}::date)::timestamp AT TIME ZONE ${tz} then ${taskCompletions.xpEarned} else 0 end), 0)`,
        monthlyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('month', ${forDate}::date)::timestamp AT TIME ZONE ${tz} then ${taskCompletions.xpEarned} else 0 end), 0)`,
        quarterlyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('quarter', ${forDate}::date)::timestamp AT TIME ZONE ${tz} then ${taskCompletions.xpEarned} else 0 end), 0)`,
        yearlyXp: sql<number>`coalesce(sum(case when ${taskCompletions.completedAt} >= date_trunc('year', ${forDate}::date)::timestamp AT TIME ZONE ${tz} then ${taskCompletions.xpEarned} else 0 end), 0)`,
      })
      .from(taskCompletions)
      .where(
        sql`${taskCompletions.userCharacterId} = ${userCharacterId} and ${taskCompletions.completedAt} >= date_trunc('year', ${forDate}::date)::timestamp AT TIME ZONE ${tz}`,
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
