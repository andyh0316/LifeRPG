import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOkResponse({ type: [TaskResponseDto] })
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: TaskResponseDto })
  create(@Body() body: CreateTaskDto) {
    return this.taskService.create(body);
  }
}
