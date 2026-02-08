import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { $api } from '@life-rpg/api-client';

const PERIODS = [
  { key: 'daily' as const, label: 'Daily' },
  { key: 'weekly' as const, label: 'Weekly' },
  { key: 'monthly' as const, label: 'Monthly' },
  { key: 'quarterly' as const, label: 'Quarterly' },
  { key: 'yearly' as const, label: 'Yearly' },
];

export default function GoalsProgress() {
  const { data: progress } = $api.useQuery(
    'get',
    '/user-character/goals/progress',
  );

  if (!progress) return null;

  const activePeriods = PERIODS.filter((p) => progress[p.key].target !== null);
  if (activePeriods.length === 0) return null;

  return (
    <Stack spacing={0.75} sx={{ mb: 2 }}>
      {activePeriods.map(({ key, label }) => {
        const { current, target } = progress[key];
        const pct = Math.min((current / target!) * 100, 100);

        const textLayer = (color: string) => (
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
              variant="body2"
              sx={{
                fontWeight: 600,
                color,
                fontSize: '0.8rem',
                letterSpacing: '0.03em',
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color,
                fontSize: '0.8rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {current} / {target} XP
            </Typography>
          </Box>
        );

        return (
          <Box
            key={key}
            sx={{
              position: 'relative',
              height: 28,
              borderRadius: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: `${pct}%`,
                bgcolor: 'success.main',
                transition: 'width 0.6s ease',
              }}
            />

            {/* Text on unfilled area */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(0 0 0 ${pct}%)`,
                transition: 'clip-path 0.6s ease',
              }}
            >
              {textLayer('text.primary')}
            </Box>

            {/* Text on filled area */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                clipPath: `inset(0 ${100 - pct}% 0 0)`,
                transition: 'clip-path 0.6s ease',
              }}
            >
              {textLayer('common.white')}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
