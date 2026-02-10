import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import type { Block } from './types';

export default function BlockButton({
  block,
  amountUnit,
  onClick,
}: {
  block: Block;
  amountUnit: string;
  onClick: (block: Block) => void;
}) {
  return (
    <Button
      variant="text"
      onClick={() => onClick(block)}
      sx={{
        textTransform: 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 88,
        height: 88,
        borderRadius: GAME_RADII.card,
        bgcolor: GAME_COLORS.pageBg,
        border: `1.5px solid ${GAME_COLORS.cardBorder}`,
        color: GAME_COLORS.textPrimary,
        transition: 'all 0.15s ease',
        p: 1,
        gap: 0.5,
        '&:hover': {
          bgcolor: GAME_COLORS.accentSubtle,
          borderColor: GAME_COLORS.accent,
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${GAME_COLORS.accent}20`,
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{ fontWeight: 900, fontSize: '1.25rem', lineHeight: 1 }}
        >
          {block.amount}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.6rem',
            color: GAME_COLORS.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {amountUnit === 'minutes' ? 'min' : 'count'}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          borderTop: `1px solid ${GAME_COLORS.cardBorder}`,
          pt: 0.5,
          display: 'flex',
          justifyContent: 'center',
          gap: 0.75,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            color: GAME_COLORS.coinGold,
          }}
        >
          {block.coinReward.toLocaleString()}g{' '}
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            color: GAME_COLORS.xpGreen,
          }}
        >
          {block.xpReward.toLocaleString()}xp
        </Typography>
      </Box>
    </Button>
  );
}
