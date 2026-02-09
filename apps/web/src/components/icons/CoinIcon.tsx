import type { SxProps, Theme } from '@mui/material/styles';
import GeneratingTokensIcon from '@mui/icons-material/GeneratingTokens';
import { GAME_COLORS } from '@/theme/gameTheme';

export default function CoinIcon({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <GeneratingTokensIcon
      sx={{ color: GAME_COLORS.coinGold, ...(sx as object) }}
    />
  );
}
