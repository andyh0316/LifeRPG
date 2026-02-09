import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import useActiveCharacter from '@/hooks/useActiveCharacter';
import useAnimateCountUp from '@/hooks/useAnimateCountUp';

export default function LevelBar() {
  const { active } = useActiveCharacter();

  const level = active?.level ?? 0;
  const xp = active?.xp ?? 0;

  const { data: xpLevels } = $api.useQuery('get', '/user-character/xp-levels');
  const entry = xpLevels?.find((e) => e.level === level);
  const xpInLevel = entry ? xp - entry.cumulativeXp : 0;
  const xpToNext = entry?.xpToNext ?? 0;
  const isMaxLevel = xpToNext === 0;
  const pct = isMaxLevel ? 100 : Math.min((xpInLevel / xpToNext) * 100, 100);
  const animatedXpInLevel = useAnimateCountUp(xpInLevel);

  return (
    <Box
      sx={{
        position: 'relative',
        height: 22,
        borderRadius: GAME_RADII.progressBar,
        bgcolor: 'rgba(255,255,255,0.1)',
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
          bgcolor: GAME_COLORS.xpGreen,
          transition: 'width 0.6s ease',
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
          px: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          Lv. {level}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.6rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {isMaxLevel
            ? 'MAX'
            : `${animatedXpInLevel.toLocaleString()} / ${xpToNext.toLocaleString()} XP`}
        </Typography>
      </Box>
    </Box>
  );
}
