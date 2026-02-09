import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import useAnimateCountUp from '@/hooks/useAnimateCountUp';

function getBarGreen(pct: number): string {
  const l = 78 - (pct / 100) * 36;
  return `hsl(142, 60%, ${l}%)`;
}

export default function CompletionProgressBar({
  current,
  target,
  initialCurrent,
}: {
  current: number;
  target: number | null;
  initialCurrent: number;
}) {
  const animated = useAnimateCountUp(current, 800, initialCurrent);
  const pct = target ? Math.min((animated / target) * 100, 100) : 0;
  const barColor = getBarGreen(pct);

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
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: `${pct}%`,
          borderRadius: GAME_RADII.progressBar,
          bgcolor: barColor,
        }}
      />
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          px: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: GAME_COLORS.textPrimary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {target
            ? `${animated.toLocaleString()} / ${target.toLocaleString()} XP`
            : `${animated.toLocaleString()} XP`}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: GAME_COLORS.textPrimary,
          }}
        >
          Today
        </Typography>
      </Box>
    </Box>
  );
}
