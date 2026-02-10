import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import useActiveCharacter from '@/hooks/useActiveCharacter';
import useLevelBarAnimation from '@/hooks/useLevelBarAnimation';
import playLevelUpSound from '@/utils/playLevelUpSound';

function getBarGreen(pct: number): string {
  const l = 78 - (pct / 100) * 36;
  return `hsl(142, 60%, ${l}%)`;
}

export default function LevelBar({
  enableSound = false,
}: { enableSound?: boolean } = {}) {
  const { active } = useActiveCharacter();
  const level = active?.level ?? 0;
  const xp = active?.xp ?? 0;

  const { data: xpLevels } = $api.useQuery('get', '/user-character/xp-levels');

  const {
    pct,
    displayLevel,
    displayXp,
    displayXpToNext,
    isMaxLevel,
    isAnimating,
    levelUpCount,
  } = useLevelBarAnimation(level, xp, xpLevels, active?.id);

  const [acknowledgedCount, setAcknowledgedCount] = useState(0);
  const bouncing = levelUpCount > 0 && levelUpCount !== acknowledgedCount;
  const prevLevelUpCountRef = useRef(0);

  useEffect(() => {
    if (levelUpCount > 0 && levelUpCount !== prevLevelUpCountRef.current) {
      prevLevelUpCountRef.current = levelUpCount;
      if (enableSound) playLevelUpSound();
    }
  }, [levelUpCount, enableSound]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: 32,
        borderRadius: GAME_RADII.progressBar,
        bgcolor: GAME_COLORS.progressTrack,
        overflow: 'hidden',
        ...(bouncing && {
          animation: 'levelUpBounce 0.35s ease-out',
        }),
      }}
      onAnimationEnd={() => setAcknowledgedCount(levelUpCount)}
    >
      {/* Fill */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: `${pct}%`,
          borderRadius: GAME_RADII.progressBar,
          bgcolor: getBarGreen(pct),
          ...(isAnimating &&
            pct > 95 && {
              boxShadow: `0 0 8px ${getBarGreen(pct)}`,
            }),
        }}
      />

      {/* Labels inside the bar */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: GAME_COLORS.textPrimary,
            lineHeight: 1,
          }}
        >
          Lv. {displayLevel}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: GAME_COLORS.textPrimary,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {isMaxLevel
            ? 'MAX'
            : `${displayXp.toLocaleString()} / ${displayXpToNext.toLocaleString()} XP`}
        </Typography>
      </Box>
    </Box>
  );
}
