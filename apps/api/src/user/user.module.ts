import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    UserService,
  ],
})
export class UserModule {}
