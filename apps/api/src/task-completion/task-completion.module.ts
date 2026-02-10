import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { UserCharacterModule } from '../user-character/user-character.module';
import { TaskCompletionController } from './task-completion.controller';
import { TaskCompletionService } from './task-completion.service';
import { TaskCompletionRepository } from './task-completion.repository';

@Module({
  imports: [UserCharacterModule],
  controllers: [TaskCompletionController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    TaskCompletionService,
    TaskCompletionRepository,
  ],
  exports: [TaskCompletionRepository],
})
export class TaskCompletionModule {}
