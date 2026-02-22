import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { TaskLogService } from './task-log.service';
import { TaskLogResponseDto } from './dto/task-log-response.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ClientTimezone } from '../common/client-timezone.decorator';

@Controller('task-log')
export class TaskLogController {
  constructor(private readonly taskLogService: TaskLogService) {}

  @Get()
  @ApiOkResponse({ type: TaskLogResponseDto })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  getTaskLog(
    @CurrentUser() user: AuthUser,
    @ClientTimezone() timezone: string,
    @Query('pageSize') pageSizeRaw?: string,
    @Query('cursor') cursor?: string,
  ): Promise<TaskLogResponseDto> {
    const pageSize = pageSizeRaw
      ? Math.max(1, Math.min(31, parseInt(pageSizeRaw, 10) || 7))
      : 7;
    return this.taskLogService.getTaskLog(
      user.userCharacterId,
      timezone,
      pageSize,
      cursor,
    );
  }
}
