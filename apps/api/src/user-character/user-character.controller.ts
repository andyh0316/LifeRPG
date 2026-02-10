import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionService } from '../auth/session.service';
import { UserCharacterService } from './user-character.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { GoalsResponseDto } from './dto/goals-response.dto';
import { GoalsProgressResponseDto } from './dto/goals-progress-response.dto';
import { CharacterSummaryResponseDto } from './dto/character-summary-response.dto';
import { SelectCharacterDto } from '../auth/dto/select-character.dto';
import { XpLevelDto } from './dto/xp-level.dto';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ClientTimezone } from '../common/client-timezone.decorator';
import { XP_TABLE } from './leveling';

@Controller('user-character')
export class UserCharacterController {
  constructor(
    private readonly userCharacterService: UserCharacterService,
    private readonly sessionService: SessionService,
  ) {}

  @Get('summary')
  @ApiOkResponse({ type: CharacterSummaryResponseDto })
  async getSummary(
    @CurrentUser() user: AuthUser,
  ): Promise<CharacterSummaryResponseDto> {
    const characters = await this.userCharacterService.getCharacters(user.id);
    return {
      activeCharacterId: user.userCharacterId,
      characters,
    };
  }

  @Patch('select')
  @ApiOkResponse({ type: CharacterSummaryResponseDto })
  async selectCharacter(
    @Req() req: Request,
    @Body() dto: SelectCharacterDto,
    @CurrentUser() user: AuthUser,
  ): Promise<CharacterSummaryResponseDto> {
    const rawToken = req.cookies?.['session_token'];
    await this.sessionService.selectCharacter(
      rawToken,
      dto.characterId,
      user.id,
    );
    const characters = await this.userCharacterService.getCharacters(user.id);
    return {
      activeCharacterId: dto.characterId,
      characters,
    };
  }

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
  getGoalsProgress(
    @CurrentUser() user: AuthUser,
    @ClientTimezone() timezone: string,
  ) {
    return this.userCharacterService.getGoalsProgress(
      user.userCharacterId,
      undefined,
      timezone,
    );
  }

  @Get('xp-levels')
  @ApiOkResponse({ type: [XpLevelDto] })
  getXpLevels() {
    return XP_TABLE;
  }
}
