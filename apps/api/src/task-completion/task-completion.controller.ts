import { Controller, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { TaskCompletionService } from './task-completion.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';

@Controller('tasks')
export class TaskCompletionController {
  constructor(
    private readonly taskCompletionService: TaskCompletionService,
  ) {}

  @Post(':id/complete')
  @ApiCreatedResponse({ type: TaskCompletionResponseDto })
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CompleteTaskDto,
  ) {
    return this.taskCompletionService.complete(id, body.userId);
  }
}
