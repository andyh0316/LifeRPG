import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { TaskRepository, TaskRow } from './task.repository';
import { TaskOptionRepository, TaskOptionRow } from './task-option.repository';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskOptionResponseDto } from './dto/task-option-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskOptionRepository: TaskOptionRepository,
    @Inject('DATABASE') private db: Db,
  ) {}

  private toDto(row: TaskRow, optionRows: TaskOptionRow[]): TaskResponseDto {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      desc: row.description,
      xpReward: row.xpReward,
      coinReward: row.coinReward,
      icon: row.icon,
      goalUnit: row.goalUnit,
      options: optionRows.map(
        (o): TaskOptionResponseDto => ({
          id: o.id,
          goal: o.goal,
          xpReward: o.xpReward,
          coinReward: o.coinReward,
        }),
      ),
    };
  }

  async findAll(): Promise<TaskResponseDto[]> {
    const rows = await this.taskRepository.findAll();
    return rows.map((row) => this.toDto(row, []));
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const row = await this.taskRepository.findById(id);

    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return this.toDto(row, []);
  }

  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    return this.db.transaction(async (tx) => {
      const task = await this.taskRepository.create(
        {
          userId: dto.userId,
          name: dto.name,
          description: dto.desc,
          xpReward: dto.xpReward,
          coinReward: dto.coinReward,
          icon: dto.icon,
          goalUnit: dto.goalUnit,
        },
        tx,
      );

      let options: TaskOptionRow[];

      if (dto.options) {
        options = await this.taskOptionRepository.createMany(
          dto.options.map((o, i) => ({
            taskId: task.id,
            goal: o.goal,
            xpReward: o.xpReward,
            coinReward: o.coinReward,
            sortOrder: i,
          })),
          tx,
        );
      } else {
        const option = await this.taskOptionRepository.create(
          {
            taskId: task.id,
            xpReward: dto.xpReward,
            coinReward: dto.coinReward,
          },
          tx,
        );
        options = [option];
      }

      return this.toDto(task, options);
    });
  }

  // userA: [A B C (new)]
  // userB: [A B D (new)]
  async update(id: number, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    return this.db.transaction(async (tx) => {
      const taskFields = {
        name: dto.name,
        description: dto.desc,
        xpReward: dto.xpReward,
        coinReward: dto.coinReward,
        icon: dto.icon,
        goalUnit: dto.goalUnit,
      };

      const hasTaskFields = Object.values(taskFields).some(
        (v) => v !== undefined,
      );

      let task: TaskRow | undefined;

      if (hasTaskFields) {
        task = await this.taskRepository.update(id, taskFields, tx);
      } else {
        task = await this.taskRepository.findById(id);
      }

      if (!task) {
        throw new NotFoundException(`Task ${id} not found`);
      }

      let options: TaskOptionRow[];

      if (dto.options) {
        const toDelete = dto.options.filter((o) => o.id != null && o.delete);
        const toUpdate = dto.options.filter((o) => o.id != null && !o.delete);
        const toCreate = dto.options.filter((o) => o.id == null);

        await this.taskOptionRepository.deleteByIds(
          toDelete.map((o) => o.id!),
          tx,
        );

        await Promise.all(
          toUpdate.map((o, i) =>
            this.taskOptionRepository.update(
              o.id!,
              {
                goal: o.goal,
                xpReward: o.xpReward,
                coinReward: o.coinReward,
                sortOrder: i,
              },
              tx,
            ),
          ),
        );

        if (toCreate.length) {
          await this.taskOptionRepository.createMany(
            toCreate.map((o, i) => ({
              taskId: id,
              goal: o.goal,
              xpReward: o.xpReward,
              coinReward: o.coinReward,
              sortOrder: toUpdate.length + i,
            })),
            tx,
          );
        }

        options = await this.taskOptionRepository.findByTaskId(id, tx);
      } else {
        options = await this.taskOptionRepository.findByTaskId(id, tx);
      }

      return this.toDto(task, options);
    });
  }
}
