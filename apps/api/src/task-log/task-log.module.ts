import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { TaskLogController } from './task-log.controller';
import { TaskLogService } from './task-log.service';
import { TaskLogRepository } from './task-log.repository';

@Module({
  controllers: [TaskLogController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    TaskLogService,
    TaskLogRepository,
  ],
})
export class TaskLogModule {}
