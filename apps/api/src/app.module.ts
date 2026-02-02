import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { TaskCompletionModule } from './task-completion/task-completion.module';

@Module({
  imports: [UserModule, TaskModule, TaskCompletionModule],
})
export class AppModule {}
