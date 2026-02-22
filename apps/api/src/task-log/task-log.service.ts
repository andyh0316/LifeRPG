import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../task/task.repository';
import { TaskCompletionRepository } from '../task-completion/task-completion.repository';
import type {
  TaskLogResponseDto,
  TaskLogDayEntryDto,
  TaskLogTaskDto,
} from './dto/task-log-response.dto';

@Injectable()
export class TaskLogService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskCompletionRepository: TaskCompletionRepository,
  ) {}

  async getTaskLog(
    userCharacterId: number,
    timezone: string,
    pageSize: number,
    cursor?: string,
  ): Promise<TaskLogResponseDto> {
    const endDate = cursor
      ? subtractDays(cursor, 1)
      : todayInTimezone(timezone);
    const startDate = subtractDays(endDate, pageSize - 1);

    const activeTasks = await this.taskRepository.findAll({
      userCharacterId,
      columns: {
        id: true,
        name: true,
        icon: true,
        goalAmount: true,
        goalPeriod: true,
        amountUnit: true,
      },
    });

    const tasks: TaskLogTaskDto[] = activeTasks.map((t) => ({
      taskId: t.id,
      taskName: t.name,
      taskIcon: t.icon,
      goalAmount: t.goalAmount,
      goalPeriod: t.goalPeriod ?? null,
      amountUnit: t.amountUnit,
    }));

    if (activeTasks.length === 0) {
      return {
        tasks,
        days: buildEmptyDays(startDate, endDate),
        nextCursor: startDate,
      };
    }

    const taskIds = activeTasks.map((t) => t.id);
    const completionMap =
      await this.taskCompletionRepository.getCompletionsByDay(
        taskIds,
        startDate,
        endDate,
        timezone,
      );

    const days: TaskLogDayEntryDto[] = [];
    let d = endDate;
    while (d >= startDate) {
      const completions = activeTasks.map(
        (t) => completionMap.get(`${t.id}:${d}`) ?? 0,
      );
      days.push({ date: d, completions });
      d = subtractDays(d, 1);
    }

    return { tasks, days, nextCursor: startDate };
  }
}

function todayInTimezone(timezone: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
}

function subtractDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function buildEmptyDays(
  startDate: string,
  endDate: string,
): TaskLogDayEntryDto[] {
  const days: TaskLogDayEntryDto[] = [];
  let d = endDate;
  while (d >= startDate) {
    days.push({ date: d, completions: [] });
    d = subtractDays(d, 1);
  }
  return days;
}
