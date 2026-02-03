import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';

@Module({
  controllers: [TaskController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    TaskRepository,
    TaskService,
  ],
})
export class TaskModule {}
