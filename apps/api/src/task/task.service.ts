import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Db } from '@life-rpg/database';
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
    @Inject('DATABASE') private db: Db,
  ) {}

  private toDto(row: TaskRow, blockRows: TaskBlockRow[]): TaskResponseDto {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      desc: row.description,
      icon: row.icon,
      sortOrder: row.sortOrder,
      amountUnit: row.amountUnit,
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

  async findAll(userId: number): Promise<TaskResponseDto[]> {
    const rows = await this.taskRepository.findAll({
      userId,
      includeBlocks: true,
    });
    return rows.map((row) => this.toDto(row, row.blocks));
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const row = await this.taskRepository.findById(id);

    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    const blocks = await this.taskBlockRepository.findByTaskId(id);
    return this.toDto(row, blocks);
  }

  async create(dto: CreateTaskDto, userId: number): Promise<TaskResponseDto> {
    return this.db.transaction(async (tx) => {
      const sortOrder = await this.taskRepository.getNextSortOrder(userId, tx);
      const task = await this.taskRepository.create(
        {
          userId,
          name: dto.name,
          description: dto.desc,
          icon: dto.icon,
          amountUnit: dto.amountUnit,
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
