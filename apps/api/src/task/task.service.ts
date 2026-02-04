import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { TaskRepository, TaskRow } from './task.repository';
import { TaskOptionRepository } from './task-option.repository';
import { TaskResponseDto } from './dto/task-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskOptionRepository: TaskOptionRepository,
    @Inject('DATABASE') private db: Db,
  ) {}

  private toDto(row: TaskRow): TaskResponseDto {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      desc: row.description,
      xpReward: row.xpReward,
      coinReward: row.coinReward,
      icon: row.icon,
    };
  }

  async findAll(): Promise<TaskResponseDto[]> {
    const rows = await this.taskRepository.findAll();
    return rows.map((row) => this.toDto(row));
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const row = await this.taskRepository.findById(id);

    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return this.toDto(row);
  }

  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    const row = await this.db.transaction(async (tx) => {
      const task = await this.taskRepository.create(
        {
          userId: dto.userId,
          name: dto.name,
          description: dto.desc,
          xpReward: dto.xpReward,
          coinReward: dto.coinReward,
          icon: dto.icon,
        },
        tx,
      );

      await this.taskOptionRepository.create(
        {
          taskId: task.id,
          xpReward: dto.xpReward,
          coinReward: dto.coinReward,
        },
        tx,
      );

      return task;
    });

    return this.toDto(row);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.desc !== undefined) data.description = dto.desc;
    if (dto.xpReward !== undefined) data.xpReward = dto.xpReward;
    if (dto.coinReward !== undefined) data.coinReward = dto.coinReward;
    if (dto.icon !== undefined) data.icon = dto.icon;

    const row = await this.taskRepository.update(id, data);

    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return this.toDto(row);
  }
}
