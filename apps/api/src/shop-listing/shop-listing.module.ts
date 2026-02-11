import { Module } from '@nestjs/common';
import { createDb } from '@life-rpg/database';
import { ShopListingController } from './shop-listing.controller';
import { ShopListingService } from './shop-listing.service';
import { ShopListingRepository } from './shop-listing.repository';

@Module({
  controllers: [ShopListingController],
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        return createDb(process.env.DATABASE_URL!);
      },
    },
    ShopListingRepository,
    ShopListingService,
  ],
  exports: [ShopListingRepository],
})
export class ShopListingModule {}
