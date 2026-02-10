import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import useActiveCharacter from '@/hooks/useActiveCharacter';
import useLevelBarAnimation from '@/hooks/useLevelBarAnimation';

function getBarGreen(pct: number): string {
  const l = 78 - (pct / 100) * 36;
  return `hsl(142, 60%, ${l}%)`;
}

export default function LevelBar() {
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
  } = useLevelBarAnimation(level, xp, xpLevels, active?.id);

  return (
    <Box
      sx={{
        position: 'relative',
        height: 32,
        borderRadius: GAME_RADII.progressBar,
        bgcolor: GAME_COLORS.progressTrack,
        overflow: 'hidden',
      }}
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
