import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { tasks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { TaskResponseDto } from './dto/task-response.dto';
import { CreateTaskDto } from './dto/create-task.dto';

const taskSelect = {
  id: tasks.id,
  name: tasks.name,
  description: tasks.description,
  xpReward: tasks.xpReward,
  coinReward: tasks.coinReward,
  icon: tasks.icon,
};

@Injectable()
export class TaskService {
  constructor(@Inject('DATABASE') private db: Db) {}

  // Returns all tasks.
  async findAll(): Promise<TaskResponseDto[]> {
    return this.db.select(taskSelect).from(tasks);
  }

  // Finds a single task by ID, throws 404 if not found.
  async findOne(id: number): Promise<TaskResponseDto> {
    const [task] = await this.db
      .select(taskSelect)
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return task;
  }

  // Creates a new task and returns it.
  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    const [task] = await this.db
      .insert(tasks)
      .values(dto)
      .returning(taskSelect);
    return task;
  }
}
