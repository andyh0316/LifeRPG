import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOkResponse({ type: [TaskResponseDto] })
  findAll() {
    return this.taskService.findAll();
  }

  @Post(':id/complete')
  @ApiCreatedResponse({ type: TaskCompletionResponseDto })
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CompleteTaskDto,
  ) {
    return this.taskService.complete(id, body.userId);
  }
}
