import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserCharacterService } from './user-character.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { GoalsResponseDto } from './dto/goals-response.dto';
import { GoalsProgressResponseDto } from './dto/goals-progress-response.dto';
import { XpLevelDto } from './dto/xp-level.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { XP_TABLE } from './leveling';

@Controller('user-character')
export class UserCharacterController {
  constructor(private readonly userCharacterService: UserCharacterService) {}

  @Get('goals')
  @ApiOkResponse({ type: GoalsResponseDto })
  getGoals(@CurrentUser() user: AuthUser) {
    return this.userCharacterService.getGoals(user.userCharacterId);
  }

  @Patch('goals')
  @ApiOkResponse({ type: GoalsResponseDto })
  updateGoals(@Body() dto: UpdateGoalsDto, @CurrentUser() user: AuthUser) {
    return this.userCharacterService.updateGoals(user.userCharacterId, dto);
  }

  @Get('goals/progress')
  @ApiOkResponse({ type: GoalsProgressResponseDto })
  getGoalsProgress(@CurrentUser() user: AuthUser) {
    return this.userCharacterService.getGoalsProgress(user.userCharacterId);
  }

  @Get('xp-levels')
  @ApiOkResponse({ type: [XpLevelDto] })
  getXpLevels() {
    return XP_TABLE;
  }
}
