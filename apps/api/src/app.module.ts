import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { TaskCompletionModule } from './task-completion/task-completion.module';
import { UserCharacterModule } from './user-character/user-character.module';
import { ItemModule } from './item/item.module';
import { ShopListingModule } from './shop-listing/shop-listing.module';
import { InventoryItemModule } from './inventory-item/inventory-item.module';
import { AuthModule } from './auth/auth.module';
import { SessionGuard } from './auth/session.guard';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TaskModule,
    TaskCompletionModule,
    UserCharacterModule,
    ItemModule,
    ShopListingModule,
    InventoryItemModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
})
export class AppModule {}
