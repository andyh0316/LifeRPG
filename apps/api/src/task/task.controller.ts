import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TaskTemplateDto } from './dto/task-template.dto';
import { TASK_TEMPLATES } from './task-templates.data';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOkResponse({ type: [TaskResponseDto] })
  findAll(@CurrentUser() user: AuthUser) {
    return this.taskService.findAll(user.userCharacterId);
  }

  @Get('templates')
  @ApiOkResponse({ type: [TaskTemplateDto] })
  getTemplates(): TaskTemplateDto[] {
    return TASK_TEMPLATES;
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() body: ReorderTasksDto) {
    return this.taskService.reorder(body.ids);
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: TaskResponseDto })
  create(@Body() body: CreateTaskDto, @CurrentUser() user: AuthUser) {
    return this.taskService.create(body, user.userCharacterId);
  }

  @Put(':id')
  @ApiOkResponse({ type: TaskResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTaskDto) {
    return this.taskService.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(id);
  }
}
