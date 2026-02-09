import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { AuthModule } from '../auth/auth.module';
import { UserCharacterController } from './user-character.controller';
import { UserCharacterService } from './user-character.service';

@Module({
  imports: [AuthModule],
  controllers: [UserCharacterController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    UserCharacterService,
  ],
  exports: [UserCharacterService],
})
export class UserCharacterModule {}
