import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { TaskCompletionRepository } from '../task-completion/task-completion.repository';
import { TaskRepository, TaskRow } from './task.repository';
import { TaskBlockRepository, TaskBlockRow } from './task-block.repository';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskBlockResponseDto } from './dto/task-block-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskBlockDto } from './dto/update-task-block.dto';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskBlockRepository: TaskBlockRepository,
    private readonly taskCompletionRepository: TaskCompletionRepository,
    @Inject('DATABASE') private db: Db,
  ) {}

  private toDto(
    row: TaskRow,
    blockRows: TaskBlockRow[],
    goalCompletedAmount?: number | null,
    currentStreak: number = 0,
  ): TaskResponseDto {
    return {
      id: row.id,
      userCharacterId: row.userCharacterId,
      name: row.name,
      desc: row.description,
      icon: row.icon,
      sortOrder: row.sortOrder,
      amountUnit: row.amountUnit,
      goalAmount: row.goalAmount ?? null,
      goalPeriod: row.goalPeriod ?? null,
      goalCompletedAmount: goalCompletedAmount ?? null,
      currentStreak,
      blocks: blockRows.map(
        (o): TaskBlockResponseDto => ({
          id: o.id,
          sortOrder: o.sortOrder,
          amount: o.amount,
          xpReward: o.xpReward,
          coinReward: o.coinReward,
        }),
      ),
    };
  }

  async findAll(
    userCharacterId: number,
    timezone: string = 'UTC',
    forDate: string = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    }),
  ): Promise<TaskResponseDto[]> {
    const rows = await this.taskRepository.findAll({
      userCharacterId,
      includeBlocks: true,
    });

    const [goalProgressMap, streakMap] = await Promise.all([
      this.getGoalProgress(rows, timezone, forDate),
      this.getCurrentStreaks(rows, timezone, forDate),
    ]);

    return rows.map((row) =>
      this.toDto(
        row,
        row.blocks,
        goalProgressMap.get(row.id) ?? null,
        streakMap.get(row.id) ?? 0,
      ),
    );
  }

  private async getCurrentStreaks(
    rows: TaskRow[],
    timezone: string,
    forDate: string,
  ): Promise<Map<number, number>> {
    const taskIds = rows.map((r) => r.id);
    const dailyAmountsMap =
      await this.taskCompletionRepository.getDailyCompletionAmounts(
        taskIds,
        timezone,
      );

    const todayStr = forDate;
    const map = new Map<number, number>();
    for (const row of rows) {
      const dailyAmounts = dailyAmountsMap.get(row.id) ?? [];
      const period = row.goalPeriod ?? 'day-long';

      // Sum daily amounts per period (day/week/month), excluding future data
      const periodTotals = new Map<string, number>();
      for (const d of dailyAmounts) {
        if (d.day > todayStr) continue;
        const p = this.periodStart(d.day, period);
        periodTotals.set(p, (periodTotals.get(p) ?? 0) + d.total);
      }

      const qualifyingPeriods = [...periodTotals.entries()]
        .filter(
          ([, total]) => row.goalAmount == null || total >= row.goalAmount,
        )
        .map(([p]) => p);

      map.set(
        row.id,
        this.calculateCurrentStreak(qualifyingPeriods, todayStr, period),
      );
    }
    return map;
  }

  private calculateCurrentStreak(
    qualifyingDays: string[],
    todayStr: string,
    goalPeriod: string,
  ): number {
    if (qualifyingDays.length === 0) return 0;

    // Round to period starts and deduplicate
    const periodStarts = [
      ...new Set(qualifyingDays.map((d) => this.periodStart(d, goalPeriod))),
    ].sort((a, b) => b.localeCompare(a));

    const currentPeriod = this.periodStart(todayStr, goalPeriod);
    const prevPeriod = this.prevPeriod(currentPeriod, goalPeriod);

    // Streak is alive only if most recent qualifying period is current or previous
    if (periodStarts[0] !== currentPeriod && periodStarts[0] !== prevPeriod)
      return 0;

    // Count consecutive qualifying periods from the most recent
    let streak = 1;
    const periodSet = new Set(periodStarts);
    let check = this.prevPeriod(periodStarts[0], goalPeriod);
    while (periodSet.has(check)) {
      streak++;
      check = this.prevPeriod(check, goalPeriod);
    }
    return streak;
  }

  private periodStart(dateStr: string, goalPeriod: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    switch (goalPeriod) {
      case 'week-long': {
        const dow = d.getDay();
        d.setDate(d.getDate() - ((dow + 6) % 7)); // round to Monday
        return d.toISOString().slice(0, 10);
      }
      case 'month-long':
        d.setDate(1);
        return d.toISOString().slice(0, 10);
      default:
        return dateStr;
    }
  }

  private prevPeriod(dateStr: string, goalPeriod: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    switch (goalPeriod) {
      case 'week-long':
        d.setDate(d.getDate() - 7);
        break;
      case 'month-long':
        d.setMonth(d.getMonth() - 1);
        break;
      default:
        d.setDate(d.getDate() - 1);
        break;
    }
    return d.toISOString().slice(0, 10);
  }

  // Map<taskId, completedAmount> for tasks that have goals
  private async getGoalProgress(
    rows: (TaskRow & { blocks: TaskBlockRow[] })[],
    timezone: string,
    forDate: string,
  ): Promise<Map<number, number>> {
    const taskIdsWithGoals = rows
      .filter((r) => r.goalPeriod != null)
      .map((r) => r.id);

    return this.taskCompletionRepository.sumAmountsByTaskIds(
      taskIdsWithGoals,
      timezone,
      forDate,
    );
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const row = await this.taskRepository.findById(id);

    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    const blocks = await this.taskBlockRepository.findByTaskId(id);
    return this.toDto(row, blocks);
  }

  async create(
    dto: CreateTaskDto,
    userCharacterId: number,
  ): Promise<TaskResponseDto> {
    return this.db.transaction(async (tx) => {
      const sortOrder = await this.taskRepository.getNextSortOrder(
        userCharacterId,
        tx,
      );
      const task = await this.taskRepository.create(
        {
          userCharacterId,
          name: dto.name,
          description: dto.desc,
          icon: dto.icon,
          amountUnit: dto.amountUnit,
          goalAmount: dto.goalAmount,
          goalPeriod: dto.goalPeriod,
          sortOrder,
        },
        tx,
      );

      let blocks: TaskBlockRow[];

      if (!dto.blocks?.length) {
        throw new BadRequestException('Task must have at least one block');
      }

      blocks = await this.taskBlockRepository.createMany(
        dto.blocks.map((o, i) => ({
          taskId: task.id,
          amount: o.amount,
          xpReward: o.xpReward,
          coinReward: o.coinReward,
          sortOrder: i,
        })),
        tx,
      );

      return this.toDto(task, blocks);
    });
  }

  async reorder(ids: number[]): Promise<void> {
    const updates = ids.map((id, i) => ({ id, sortOrder: i }));
    await this.taskRepository.updateSortOrders(updates);
  }

  async remove(id: number): Promise<TaskResponseDto> {
    const row = await this.taskRepository.softDelete(id);
    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    const blocks = await this.taskBlockRepository.findByTaskId(id);
    return this.toDto(row, blocks);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    return this.db.transaction(async (tx) => {
      const task = await this.taskRepository.update(
        id,
        {
          name: dto.name,
          description: dto.desc,
          icon: dto.icon,
          amountUnit: dto.amountUnit,
          goalAmount: dto.goalAmount,
          goalPeriod: dto.goalPeriod,
        },
        tx,
      );

      if (!task) {
        throw new NotFoundException(`Task ${id} not found`);
      }

      const toUpdate: { dto: UpdateTaskBlockDto; sortOrder: number }[] = [];
      const toCreate: { dto: UpdateTaskBlockDto; sortOrder: number }[] = [];

      dto.blocks.forEach((block, i) => {
        if (block.id != null) {
          toUpdate.push({ dto: block, sortOrder: i });
        } else {
          toCreate.push({ dto: block, sortOrder: i });
        }
      });

      const keepIds = toUpdate.map((o) => o.dto.id!);

      await this.taskBlockRepository.deleteByTaskIdExcept(id, keepIds, tx);

      await Promise.all(
        toUpdate.map((o) =>
          this.taskBlockRepository.update(
            o.dto.id!,
            {
              amount: o.dto.amount,
              xpReward: o.dto.xpReward,
              coinReward: o.dto.coinReward,
              sortOrder: o.sortOrder,
            },
            tx,
          ),
        ),
      );

      if (toCreate.length) {
        await this.taskBlockRepository.createMany(
          toCreate.map((o) => ({
            taskId: id,
            amount: o.dto.amount,
            xpReward: o.dto.xpReward,
            coinReward: o.dto.coinReward,
            sortOrder: o.sortOrder,
          })),
          tx,
        );
      }

      const blocks = await this.taskBlockRepository.findByTaskId(id, tx);

      return this.toDto(task, blocks);
    });
  }
}
