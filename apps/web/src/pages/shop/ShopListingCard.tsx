import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { $api, type components } from '@life-rpg/api-client';
import TaskIcon from '@/components/icons/TaskIcon';
import { useToast } from '@/components/toast';
import { GAME_COLORS, GAME_SHADOWS, sxCard } from '@/theme/gameTheme';

type ShopListingResponseDto = components['schemas']['ShopListingResponseDto'];
type ItemResponseDto = components['schemas']['ItemResponseDto'];

interface ShopListingCardProps extends ShopListingResponseDto {
  item?: ItemResponseDto;
  index?: number;
}

export default function ShopListingCard({
  id,
  itemId,
  coinCost,
  sortOrder,
  item,
  index = 0,
}: ShopListingCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

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

  const handleDelete = () => {
    const label = item?.name ?? `Listing #${id}`;
    if (!window.confirm(`Delete "${label}" from shop?`)) return;
    deleteListing.mutate({ params: { path: { id } } });
  };

  return (
    <Box
      sx={{
        ...sxCard,
        mb: 1.5,
        p: 2,
        animation: 'slideUpFadeIn 0.3s ease forwards',
        animationDelay: `${index * 0.04}s`,
        opacity: 0,
        '&:hover': {
          boxShadow: GAME_SHADOWS.cardHover,
          transform: 'translateY(-1px)',
        },
        '&:hover .shop-action-btn': { opacity: 1 },
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
            bgcolor: GAME_COLORS.accentSubtle,
            borderRadius: '10px',
            flexShrink: 0,
            '& .MuiSvgIcon-root': { color: GAME_COLORS.accent, fontSize: 20 },
          }}
        >
          {item?.icon ? <TaskIcon name={item.icon} /> : <MonetizationOnIcon />}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: GAME_COLORS.textPrimary,
              lineHeight: 1.3,
            }}
          >
            {item?.name ?? `Item #${itemId}`}
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}
          >
            <MonetizationOnIcon
              sx={{ fontSize: 14, color: GAME_COLORS.accent }}
            />
            <Typography
              sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: GAME_COLORS.accent,
              }}
            >
              {coinCost}
            </Typography>
          </Box>
        </Box>

        <IconButton
          className="shop-action-btn"
          size="small"
          onClick={() => navigate(`/shop/${id}/edit`)}
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: GAME_COLORS.textMuted,
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          className="shop-action-btn"
          size="small"
          onClick={handleDelete}
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: GAME_COLORS.textMuted,
            '&:hover': { color: '#e53935' },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
