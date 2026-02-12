import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CoinDisplay from '@/components/CoinDisplay';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { $api, type components } from '@life-rpg/api-client';
import TaskIcon from '@/components/icons/TaskIcon';
import { useToast } from '@/components/toast';
import useActiveCharacter from '@/hooks/useActiveCharacter';
import {
  GAME_COLORS,
  GAME_RADII,
  GAME_SHADOWS,
  sxCard,
} from '@/theme/gameTheme';

type ShopListingResponseDto = components['schemas']['ShopListingResponseDto'];
type ItemResponseDto = components['schemas']['ItemResponseDto'];

interface ShopListingCardProps extends ShopListingResponseDto {
  item?: ItemResponseDto;
  index?: number;
  editing?: boolean;
}

export default function ShopListingCard({
  id,
  itemId,
  coinCost,
  sortOrder,
  item,
  index = 0,
  editing = false,
}: ShopListingCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { active } = useActiveCharacter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const deleteListing = $api.useMutation('delete', '/shop-listings/{id}', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/shop-listings').queryKey,
      });
      toast.success('Listing deleted');
    },
    onError: () => {
      toast.error('Failed to delete listing');
    },
  });

  const buyListing = $api.useMutation('post', '/shop-listings/{id}/buy');
  const useInventoryItem = $api.useMutation('put', '/inventory-items/{id}');

  const invalidateAfterBuy = () => {
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/shop-listings').queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/inventory-items').queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/user-character/summary').queryKey,
    });
  };

  const canAfford = (active?.coins ?? 0) >= coinCost;

  const handleDelete = () => {
    const label = item?.name ?? `Listing #${id}`;
    if (!window.confirm(`Delete "${label}" from shop?`)) return;
    deleteListing.mutate({ params: { path: { id } } });
  };

  const handleBuy = async () => {
    setIsPending(true);
    try {
      await buyListing.mutateAsync({ params: { path: { id } } });
      invalidateAfterBuy();
      setDialogOpen(false);
      toast.success(`Purchased ${item?.name ?? 'item'}!`);
    } catch {
      toast.error('Purchase failed — not enough coins?');
    } finally {
      setIsPending(false);
    }
  };

  const handleBuyAndUse = async () => {
    setIsPending(true);
    try {
      const inventoryItem = await buyListing.mutateAsync({
        params: { path: { id } },
      });
      await useInventoryItem.mutateAsync({
        params: { path: { id: inventoryItem.id } },
        body: {
          itemId: inventoryItem.itemId,
          source: inventoryItem.source,
          usedAt: new Date().toISOString(),
        },
      });
      invalidateAfterBuy();
      setDialogOpen(false);
      toast.success(`Purchased and used ${item?.name ?? 'item'}!`);
    } catch {
      toast.error('Purchase failed — not enough coins?');
    } finally {
      setIsPending(false);
    }
  };

  const itemName = item?.name ?? `Item #${itemId}`;

  const sxBuyButton = {
    fontWeight: 800,
    fontSize: '1.1rem',
    py: 2,
    width: '100%',
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
  };

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
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: GAME_COLORS.accentSubtle,
              borderRadius: '12px',
              flexShrink: 0,
              '& .MuiSvgIcon-root': {
                color: GAME_COLORS.accent,
                fontSize: 22,
              },
            }}
          >
            {item?.icon ? (
              <TaskIcon name={item.icon} />
            ) : (
              <MonetizationOnIcon />
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: GAME_COLORS.textPrimary,
                lineHeight: 1.3,
              }}
            >
              {itemName}
            </Typography>
            {item && (
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: GAME_COLORS.textSecondary,
                  mt: 0.25,
                }}
              >
                {item.amount} {item.amountUnit}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              px: 1.5,
              py: 0.5,
              borderRadius: GAME_RADII.card,
              bgcolor: GAME_COLORS.coinGoldSubtle,
              border: `1.5px solid ${GAME_COLORS.coinGold}30`,
            }}
          >
            <CoinDisplay amount={coinCost} size="sm" />
          </Box>

          {editing && (
            <>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/shop/${id}/edit`);
                }}
                sx={{ color: GAME_COLORS.textMuted }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                sx={{
                  color: GAME_COLORS.textMuted,
                  '&:hover': { color: '#e53935' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
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

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <CoinDisplay amount={coinCost} size="md" />
        </Box>

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

        {!canAfford && (
          <Typography sx={{ fontSize: '0.8rem', color: '#e53935', mb: 2 }}>
            Not enough coins
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: '100%',
          }}
        >
          <Button
            variant="contained"
            onClick={handleBuyAndUse}
            disabled={!canAfford || isPending}
            sx={{
              ...sxBuyButton,
              py: 0.6,
              fontSize: '0.85rem',
              fontWeight: 700,
              bgcolor: '#e53935',
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
            Buy and use now
          </Button>
          <Button
            variant="contained"
            onClick={handleBuy}
            disabled={!canAfford || isPending}
            sx={sxBuyButton}
          >
            Buy
          </Button>
        </Box>
      </Dialog>
    </>
  );
}
