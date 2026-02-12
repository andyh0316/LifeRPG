import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CoinIcon from './icons/CoinIcon';
import { GAME_COLORS } from '@/theme/gameTheme';

const SIZE_MAP = {
  sm: { icon: 14, text: '0.75rem', weight: 600, gap: 0.25 },
  md: { icon: 18, text: '0.9rem', weight: 700, gap: 0.5 },
  lg: { icon: 24, text: '1.3rem', weight: 800, gap: 0.75 },
} as const;

interface CoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
}

export default function CoinDisplay({
  amount,
  size = 'md',
  prefix,
}: CoinDisplayProps) {
  const s = SIZE_MAP[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
      }}
    >
      <CoinIcon sx={{ fontSize: s.icon }} />
      <Typography
        sx={{
          fontWeight: s.weight,
          fontSize: s.text,
          color: GAME_COLORS.coinGold,
          lineHeight: 1,
        }}
      >
        {prefix}
        {amount.toLocaleString()} G
      </Typography>
    </Box>
  );
}
