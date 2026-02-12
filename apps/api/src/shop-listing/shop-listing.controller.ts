import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ShopListingService } from './shop-listing.service';
import { CreateShopListingDto } from './dto/create-shop-listing.dto';
import { UpdateShopListingDto } from './dto/update-shop-listing.dto';
import { ShopListingResponseDto } from './dto/shop-listing-response.dto';
import { InventoryItemResponseDto } from '../inventory-item/dto/inventory-item-response.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

@Controller('shop-listings')
export class ShopListingController {
  constructor(private readonly shopListingService: ShopListingService) {}

  @Get()
  @ApiOkResponse({ type: [ShopListingResponseDto] })
  findAll(@CurrentUser() user: AuthUser) {
    return this.shopListingService.findAll(user.userCharacterId);
  }

  @Get(':id')
  @ApiOkResponse({ type: ShopListingResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopListingService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ShopListingResponseDto })
  create(@Body() body: CreateShopListingDto, @CurrentUser() user: AuthUser) {
    return this.shopListingService.create(body, user.userCharacterId);
  }

  @Put(':id')
  @ApiOkResponse({ type: ShopListingResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateShopListingDto,
  ) {
    return this.shopListingService.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ShopListingResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shopListingService.remove(id);
  }

  @Post(':id/buy')
  @ApiCreatedResponse({ type: InventoryItemResponseDto })
  buy(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.shopListingService.buy(id, user.userCharacterId);
  }
}
