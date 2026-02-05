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
      amountUnit: row.amountUnit,
      blocks: blockRows.map(
        (o): TaskBlockResponseDto => ({
          id: o.id,
          amount: o.amount,
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

    const blocks = await this.taskBlockRepository.findByTaskId(id);
    return this.toDto(row, blocks);
  }

  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    return this.db.transaction(async (tx) => {
      const task = await this.taskRepository.create(
        {
          userId: 1,
          name: dto.name,
          description: dto.desc,
          icon: dto.icon,
          amountUnit: dto.amountUnit,
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

      let blocks: TaskBlockRow[];

      if (dto.blocks) {
        const toDelete = dto.blocks.filter((o) => o.id != null && o.delete);
        const toUpdate = dto.blocks.filter((o) => o.id != null && !o.delete);
        const toCreate = dto.blocks.filter((o) => o.id == null);

        await this.taskBlockRepository.deleteByIds(
          toDelete.map((o) => o.id!),
          tx,
        );

        await Promise.all(
          toUpdate.map((o, i) =>
            this.taskBlockRepository.update(
              o.id!,
              {
                amount: o.amount,
                xpReward: o.xpReward,
                coinReward: o.coinReward,
                sortOrder: i,
              },
              tx,
            ),
          ),
        );

        if (toCreate.length) {
          await this.taskBlockRepository.createMany(
            toCreate.map((o, i) => ({
              taskId: id,
              amount: o.amount,
              xpReward: o.xpReward,
              coinReward: o.coinReward,
              sortOrder: toUpdate.length + i,
            })),
            tx,
          );
        }
      }

      // Re-read blocks after mutations to verify at least one remains.
      // Needed because patch semantics allow deleting some blocks while
      // keeping others that weren't mentioned in the request.
      blocks = await this.taskBlockRepository.findByTaskId(id, tx);

      if (!blocks.length) {
        throw new BadRequestException('Task must have at least one block');
      }

      return this.toDto(task, blocks);
    });
  }
}
