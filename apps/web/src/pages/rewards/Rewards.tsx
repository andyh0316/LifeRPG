import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { GAME_COLORS, sxPageTitle, sxCard } from '@/theme/gameTheme';

export default function Rewards() {
  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography sx={{ ...sxPageTitle, mb: 2 }}>Rewards</Typography>

      <Box sx={{ ...sxCard, p: 3, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.9rem', color: GAME_COLORS.textMuted }}>
          Reward shop coming soon.
        </Typography>
      </Box>
    </Box>
  );
}
