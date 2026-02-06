import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { AuthController } from './auth.controller';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => createDb(process.env.DATABASE_URL!),
    },
    SessionService,
    SessionGuard,
  ],
  exports: [SessionService, SessionGuard],
})
export class AuthModule {}
