import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { $api } from '@life-rpg/api-client';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import useAnimateCountUp from '@/hooks/useAnimateCountUp';

/** Light green at 0% → rich green at 100%. */
function getBarGreen(pct: number): string {
  // Interpolate lightness: 78% (light) → 42% (vivid)
  const l = 78 - (pct / 100) * 36;
  return `hsl(142, 60%, ${l}%)`;
}

const PERIODS = [
  { key: 'daily' as const, label: 'Today' },
  { key: 'weekly' as const, label: 'This Week' },
  { key: 'monthly' as const, label: 'This Month' },
  { key: 'quarterly' as const, label: 'This Quarter' },
  { key: 'yearly' as const, label: 'This Year' },
];

function GoalBar({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const animatedCurrent = useAnimateCountUp(current);
  const pct = Math.min((animatedCurrent / target) * 100, 100);
  const isComplete = pct >= 100;
  const barColor = getBarGreen(pct);

  return (
    <Box
      sx={{
        position: 'relative',
        height: 28,
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
          animation: isComplete ? 'subtlePulse 2s ease infinite' : undefined,
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
            fontSize: '0.75rem',
            fontWeight: 700,
            color: GAME_COLORS.textPrimary,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {animatedCurrent.toLocaleString()} / {target.toLocaleString()} XP
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: GAME_COLORS.textPrimary,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function GoalsProgress() {
  const { data: progress } = $api.useQuery(
    'get',
    '/user-character/goals/progress',
  );

  if (!progress) return null;

  const activePeriods = PERIODS.filter((p) => progress[p.key].target !== null);
  if (activePeriods.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {activePeriods.map(({ key, label }) => (
        <GoalBar
          key={key}
          label={label}
          current={progress[key].current}
          target={progress[key].target!}
        />
      ))}
    </Stack>
  );
}
