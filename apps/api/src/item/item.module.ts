import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { ItemRepository } from './item.repository';

@Module({
  controllers: [ItemController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    ItemRepository,
    ItemService,
  ],
  exports: [ItemRepository],
})
export class ItemModule {}
