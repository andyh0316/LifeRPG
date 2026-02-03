import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { tasks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { TaskResponseDto } from './dto/task-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(@Inject('DATABASE') private db: Db) {}

  // Returns all tasks.
  async findAll(): Promise<TaskResponseDto[]> {
    const rows = await this.db.select().from(tasks);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      desc: row.description,
      xpReward: row.xpReward,
      coinReward: row.coinReward,
      icon: row.icon,
    }));
  }

  // Finds a single task by ID, throws 404 if not found.
  async findOne(id: number): Promise<TaskResponseDto> {
    const [row] = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return {
      id: row.id,
      name: row.name,
      desc: row.description,
      xpReward: row.xpReward,
      coinReward: row.coinReward,
      icon: row.icon,
    };
  }

  // Creates a new task and returns it.
  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    const [row] = await this.db
      .insert(tasks)
      .values({
        name: dto.name,
        description: dto.desc,
        xpReward: dto.xpReward,
        coinReward: dto.coinReward,
        icon: dto.icon,
      })
      .returning();

    return {
      id: row.id,
      name: row.name,
      desc: row.description,
      xpReward: row.xpReward,
      coinReward: row.coinReward,
      icon: row.icon,
    };
  }

  // Updates a task by ID with the provided fields, throws 404 if not found.
  async update(id: number, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    // Build the update payload from provided fields
    const values: Record<string, unknown> = {};
    if (dto.name !== undefined) values.name = dto.name;
    if (dto.desc !== undefined) values.description = dto.desc;
    if (dto.xpReward !== undefined) values.xpReward = dto.xpReward;
    if (dto.coinReward !== undefined) values.coinReward = dto.coinReward;
    if (dto.icon !== undefined) values.icon = dto.icon;

    const [row] = await this.db
      .update(tasks)
      .set(values)
      .where(eq(tasks.id, id))
      .returning();

    if (!row) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return {
      id: row.id,
      name: row.name,
      desc: row.description,
      xpReward: row.xpReward,
      coinReward: row.coinReward,
      icon: row.icon,
    };
  }
}
