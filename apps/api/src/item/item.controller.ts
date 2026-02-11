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
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  @ApiOkResponse({ type: [ItemResponseDto] })
  findAll(@CurrentUser() user: AuthUser) {
    return this.itemService.findAll(user.userCharacterId);
  }

  @Get(':id')
  @ApiOkResponse({ type: ItemResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ItemResponseDto })
  create(@Body() body: CreateItemDto, @CurrentUser() user: AuthUser) {
    return this.itemService.create(body, user.userCharacterId);
  }

  @Put(':id')
  @ApiOkResponse({ type: ItemResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateItemDto) {
    return this.itemService.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ItemResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.remove(id);
  }
}
