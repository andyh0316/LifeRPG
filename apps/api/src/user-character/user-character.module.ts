import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { UserCharacterController } from './user-character.controller';
import { UserCharacterService } from './user-character.service';

@Module({
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
})
export class UserCharacterModule {}
