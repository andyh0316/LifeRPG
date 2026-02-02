import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { TaskCompletionController } from './task-completion.controller';
import { TaskCompletionService } from './task-completion.service';

@Module({
  controllers: [TaskCompletionController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    TaskCompletionService,
  ],
})
export class TaskCompletionModule {}
