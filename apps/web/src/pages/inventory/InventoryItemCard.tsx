import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BackpackIcon from '@mui/icons-material/Backpack';
import Chip from '@mui/material/Chip';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { $api, type components } from '@life-rpg/api-client';
import TaskIcon from '@/components/icons/TaskIcon';
import { useToast } from '@/components/toast';
import { GAME_COLORS, GAME_SHADOWS, sxCard } from '@/theme/gameTheme';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteItem = $api.useMutation('delete', '/inventory-items/{id}', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/inventory-items').queryKey,
      });
      toast.success('Inventory item deleted');
    },
    onError: () => {
      toast.error('Failed to delete inventory item');
    },
  });

  const handleDelete = () => {
    const label = item?.name ?? `Inventory item #${id}`;
    if (!window.confirm(`Delete "${label}" from inventory?`)) return;
    deleteItem.mutate({ params: { path: { id } } });
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
        '&:hover .inv-action-btn': { opacity: 1 },
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
            {item?.name ?? `Item #${itemId}`}
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}
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

        <IconButton
          className="inv-action-btn"
          size="small"
          onClick={() => navigate(`/inventory/${id}/edit`)}
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: GAME_COLORS.textMuted,
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          className="inv-action-btn"
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
