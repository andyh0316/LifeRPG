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
import { InventoryItemService } from './inventory-item.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

@Controller('inventory-items')
export class InventoryItemController {
  constructor(private readonly inventoryItemService: InventoryItemService) {}

  @Get()
  @ApiOkResponse({ type: [InventoryItemResponseDto] })
  findAll(@CurrentUser() user: AuthUser) {
    return this.inventoryItemService.findAll(user.userCharacterId);
  }

  @Get(':id')
  @ApiOkResponse({ type: InventoryItemResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryItemService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: InventoryItemResponseDto })
  create(@Body() body: CreateInventoryItemDto, @CurrentUser() user: AuthUser) {
    return this.inventoryItemService.create(body, user.userCharacterId);
  }

  @Put(':id')
  @ApiOkResponse({ type: InventoryItemResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateInventoryItemDto,
  ) {
    return this.inventoryItemService.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ type: InventoryItemResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryItemService.remove(id);
  }
}
