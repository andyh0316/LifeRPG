import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { TaskCompletionService } from './task-completion.service';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { TaskCompletionResponseDto } from './dto/task-completion-response.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

@Controller('task-completions')
export class TaskCompletionController {
  constructor(private readonly taskCompletionService: TaskCompletionService) {}

  @Get()
  @ApiOkResponse({ type: [TaskCompletionResponseDto] })
  findAll(@CurrentUser() user: AuthUser) {
    return this.taskCompletionService.findAll(user.userCharacterId);
  }

  @Post()
  @ApiCreatedResponse({ type: TaskCompletionResponseDto })
  complete(@Body() body: CompleteTaskDto, @CurrentUser() user: AuthUser) {
    return this.taskCompletionService.complete(
      body.blockId,
      user.userCharacterId,
      new Date(body.completedAt),
    );
  }

  @Post('undo')
  @HttpCode(200)
  @ApiOkResponse({ type: TaskCompletionResponseDto })
  undo(@CurrentUser() user: AuthUser) {
    return this.taskCompletionService.undoLast(user.userCharacterId);
  }
}
