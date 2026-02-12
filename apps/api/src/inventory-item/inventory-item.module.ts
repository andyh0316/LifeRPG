import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { InventoryItemController } from './inventory-item.controller';
import { InventoryItemService } from './inventory-item.service';
import { InventoryItemRepository } from './inventory-item.repository';

@Module({
  controllers: [InventoryItemController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    InventoryItemRepository,
    InventoryItemService,
  ],
  exports: [InventoryItemRepository],
})
export class InventoryItemModule {}
