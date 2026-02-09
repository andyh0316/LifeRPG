import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserCharacterService } from './user-character.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { GoalsResponseDto } from './dto/goals-response.dto';
import { GoalsProgressResponseDto } from './dto/goals-progress-response.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

@Controller('user-character')
export class UserCharacterController {
  constructor(private readonly userCharacterService: UserCharacterService) {}

  @Get('goals')
  @ApiOkResponse({ type: GoalsResponseDto })
  getGoals(@CurrentUser() user: AuthUser) {
    return this.userCharacterService.getGoals(user.id);
  }

  @Patch('goals')
  @ApiOkResponse({ type: GoalsResponseDto })
  updateGoals(@Body() dto: UpdateGoalsDto, @CurrentUser() user: AuthUser) {
    return this.userCharacterService.updateGoals(user.id, dto);
  }

  @Get('goals/progress')
  @ApiOkResponse({ type: GoalsProgressResponseDto })
  getGoalsProgress(@CurrentUser() user: AuthUser) {
    return this.userCharacterService.getGoalsProgress(user.id);
  }
}
