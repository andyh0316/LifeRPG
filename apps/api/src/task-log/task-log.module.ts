import { Module } from '@nestjs/common';
import { TaskModule } from '../task/task.module';
import { TaskCompletionModule } from '../task-completion/task-completion.module';
import { UserCharacterModule } from '../user-character/user-character.module';
import { TaskLogController } from './task-log.controller';
import { TaskLogService } from './task-log.service';

@Module({
  imports: [TaskModule, TaskCompletionModule, UserCharacterModule],
  controllers: [TaskLogController],
  providers: [TaskLogService],
})
export class TaskLogModule {}
