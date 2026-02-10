import useAnimateCountUp from '@/hooks/useAnimateCountUp';
import { GAME_COLORS, GAME_RADII, sxCard } from '@/theme/gameTheme';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import CoinIcon from '../../../components/icons/CoinIcon';
import LevelBar from '../../../components/LevelBar';
import CompletionProgressBar from './CompletionProgressBar';
import type { Block } from './types';

export default function CompletionDialog({
  name,
  amountUnit,
  confirmBlock,
  completed,
  isPending,
  progress,
  preCompletionXp,
  earnedCoins,
  onConfirm,
  onClose,
}: {
  name: string;
  amountUnit: string;
  confirmBlock: Block | null;
  completed: boolean;
  isPending: boolean;
  progress: { current: number; target: number | null } | undefined;
  preCompletionXp: number;
  earnedCoins: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const animatedCoins = useAnimateCountUp(completed ? earnedCoins : 0);

  return (
    <Dialog
      open={!!confirmBlock}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...sxCard,
          p: 4,
          textAlign: 'center',
          minWidth: 320,
        },
      }}
    >
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '1.1rem',
          color: GAME_COLORS.textPrimary,
          mb: 1,
        }}
      >
        {name}
      </Typography>

      {confirmBlock && !completed && (
        <>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: GAME_COLORS.textSecondary,
              mb: 2,
            }}
          >
            {confirmBlock.amount} {amountUnit === 'minutes' ? 'min' : 'count'}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 1,
                borderRadius: GAME_RADII.card,
                bgcolor: GAME_COLORS.coinGoldSubtle,
                border: `1.5px solid ${GAME_COLORS.coinGold}30`,
              }}
            >
              <CoinIcon sx={{ fontSize: '1.3rem' }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: GAME_COLORS.coinGold,
                }}
              >
                {confirmBlock.coinReward.toLocaleString()} G
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                borderRadius: GAME_RADII.card,
                bgcolor: GAME_COLORS.xpGreenSubtle,
                border: `1.5px solid ${GAME_COLORS.xpGreen}30`,
              }}
            >
              <StarIcon
                sx={{ fontSize: '0.95rem', color: GAME_COLORS.xpGreen }}
              />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: GAME_COLORS.xpGreen,
                }}
              >
                {confirmBlock.xpReward.toLocaleString()} XP
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {completed && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            mb: 2,
          }}
        >
          <CoinIcon sx={{ fontSize: '1.5rem' }} />
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.5rem',
              color: GAME_COLORS.coinGold,
            }}
          >
            +{animatedCoins.toLocaleString()} G
          </Typography>
        </Box>
      )}

      {/* Always-visible bars */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          width: '100%',
          mb: 3,
        }}
      >
        {progress && (
          <CompletionProgressBar
            current={progress.current}
            target={progress.target}
            initialCurrent={completed ? preCompletionXp : progress.current}
          />
        )}
        <LevelBar enableSound />
      </Box>

      {confirmBlock && !completed && (
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isPending}
          sx={{
            fontWeight: 800,
            fontSize: '1.1rem',
            py: 2,
            px: 6,
            borderRadius: GAME_RADII.card,
            bgcolor: GAME_COLORS.accent,
            color: '#fff',
            boxShadow: `0 4px 16px ${GAME_COLORS.accent}40`,
            '&:hover': {
              bgcolor: GAME_COLORS.accent,
              boxShadow: `0 6px 24px ${GAME_COLORS.accent}60`,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: `0 2px 8px ${GAME_COLORS.accent}30`,
            },
          }}
        >
          Complete
        </Button>
      )}

      {completed && (
        <Button
          variant="text"
          onClick={onClose}
          sx={{
            fontWeight: 700,
            color: GAME_COLORS.textMuted,
            fontSize: '0.9rem',
          }}
        >
          Done
        </Button>
      )}
    </Dialog>
  );
}
