import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { createDb } from '@life-rpg/database';
import { AuthController } from './auth.controller';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => createDb(process.env.DATABASE_URL!),
    },
    SessionService,
    SessionGuard,
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleStrategy] : []),
  ],
  exports: [SessionService, SessionGuard],
})
export class AuthModule {}
