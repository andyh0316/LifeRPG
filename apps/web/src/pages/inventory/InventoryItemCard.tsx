import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import BackpackIcon from '@mui/icons-material/Backpack';
import Chip from '@mui/material/Chip';
import { useQueryClient } from '@tanstack/react-query';
import { $api, type components } from '@life-rpg/api-client';
import TaskIcon from '@/components/icons/TaskIcon';
import { useToast } from '@/components/toast';
import {
  GAME_COLORS,
  GAME_RADII,
  GAME_SHADOWS,
  sxCard,
} from '@/theme/gameTheme';

type InventoryItemResponseDto =
  components['schemas']['InventoryItemResponseDto'];
type ItemResponseDto = components['schemas']['ItemResponseDto'];

interface InventoryItemCardProps extends InventoryItemResponseDto {
  item?: ItemResponseDto;
  index?: number;
}

export default function InventoryItemCard({
  id,
  itemId,
  source,
  acquiredAt,
  usedAt,
  item,
  index = 0,
}: InventoryItemCardProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const useItem = $api.useMutation('put', '/inventory-items/{id}', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/inventory-items').queryKey,
      });
      setDialogOpen(false);
      toast.success(`Used ${item?.name ?? 'item'}!`);
    },
    onError: () => {
      toast.error('Failed to use item');
    },
  });

  const handleUse = () => {
    useItem.mutate({
      params: { path: { id } },
      body: {
        itemId,
        source,
        usedAt: new Date().toISOString(),
      },
    });
  };

  const itemName = item?.name ?? `Item #${itemId}`;

  return (
    <>
      <Box
        onClick={() => setDialogOpen(true)}
        sx={{
          ...sxCard,
          mb: 1.5,
          p: 2,
          cursor: 'pointer',
          animation: 'slideUpFadeIn 0.3s ease forwards',
          animationDelay: `${index * 0.04}s`,
          opacity: 0,
          '&:hover': {
            boxShadow: GAME_SHADOWS.cardHover,
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: usedAt ? GAME_COLORS.cardBg : GAME_COLORS.accentSubtle,
              borderRadius: '10px',
              flexShrink: 0,
              '& .MuiSvgIcon-root': {
                color: usedAt ? GAME_COLORS.textMuted : GAME_COLORS.accent,
                fontSize: 20,
              },
            }}
          >
            {item?.icon ? <TaskIcon name={item.icon} /> : <BackpackIcon />}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.95rem',
                color: usedAt ? GAME_COLORS.textMuted : GAME_COLORS.textPrimary,
                lineHeight: 1.3,
                textDecoration: usedAt ? 'line-through' : 'none',
              }}
            >
              {itemName}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.25,
              }}
            >
              <Chip
                label={source}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: GAME_COLORS.accentSubtle,
                  color: GAME_COLORS.accent,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: GAME_COLORS.textMuted,
                  ml: 0.5,
                }}
              >
                {new Date(acquiredAt).toLocaleDateString()}
              </Typography>
              {usedAt && (
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: GAME_COLORS.textMuted,
                  }}
                >
                  · used {new Date(usedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              ...sxCard,
              p: 4,
              textAlign: 'center',
              minWidth: 320,
            },
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
          {itemName}
        </Typography>

        {item?.desc && (
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: GAME_COLORS.textSecondary,
              mb: 1,
            }}
          >
            {item.desc}
          </Typography>
        )}

        {item && (
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: GAME_COLORS.textSecondary,
              mb: 3,
            }}
          >
            {item.amount} {item.amountUnit}
          </Typography>
        )}

        {usedAt ? (
          <>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: GAME_COLORS.textMuted,
                mb: 2,
              }}
            >
              Used on {new Date(usedAt).toLocaleDateString()}
            </Typography>
            <Button
              variant="text"
              onClick={() => setDialogOpen(false)}
              sx={{
                fontWeight: 700,
                color: GAME_COLORS.textMuted,
                fontSize: '0.9rem',
              }}
            >
              Done
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={handleUse}
            disabled={useItem.isPending}
            sx={{
              fontWeight: 800,
              fontSize: '1.1rem',
              py: 2,
              px: 6,
              borderRadius: GAME_RADII.card,
              bgcolor: '#e53935',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(229,57,53,0.4)',
              '&:hover': {
                bgcolor: '#c62828',
                boxShadow: '0 6px 24px rgba(229,57,53,0.6)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(1px)',
                boxShadow: '0 2px 8px rgba(229,57,53,0.3)',
              },
            }}
          >
            Use
          </Button>
        )}
      </Dialog>
    </>
  );
}
