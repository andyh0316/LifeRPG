import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({ type: [UserResponseDto] })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Put(':id')
  @ApiOkResponse({ type: UserResponseDto })
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserResponseDto })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
