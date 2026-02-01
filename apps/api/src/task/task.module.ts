import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  controllers: [TaskController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    TaskService,
  ],
})
export class TaskModule {}
