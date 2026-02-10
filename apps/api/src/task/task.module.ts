import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { TaskCompletionModule } from '../task-completion/task-completion.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { TaskBlockRepository } from './task-block.repository';

@Module({
  imports: [TaskCompletionModule],
  controllers: [TaskController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    TaskRepository,
    TaskBlockRepository,
    TaskService,
  ],
})
export class TaskModule {}
