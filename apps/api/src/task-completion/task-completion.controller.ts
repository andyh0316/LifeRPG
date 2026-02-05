import { Controller, Post, Body } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { TaskCompletionService } from './task-completion.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';
import { getCurrentUserId } from '../auth/current-user';

@Controller('task-completions')
export class TaskCompletionController {
  constructor(private readonly taskCompletionService: TaskCompletionService) {}

  @Post()
  @ApiCreatedResponse({ type: TaskCompletionResponseDto })
  complete(@Body() body: CompleteTaskDto) {
    return this.taskCompletionService.complete(
      body.blockId,
      getCurrentUserId(),
    );
  }
}
