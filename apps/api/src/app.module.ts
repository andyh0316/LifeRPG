import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { TaskCompletionModule } from './task-completion/task-completion.module';
import { AuthModule } from './auth/auth.module';
import { SessionGuard } from './auth/session.guard';

@Module({
  imports: [AuthModule, UserModule, TaskModule, TaskCompletionModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
})
export class AppModule {}
