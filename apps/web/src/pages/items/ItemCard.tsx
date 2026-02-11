import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { $api, type components } from '@life-rpg/api-client';
import TaskIcon from '@/components/icons/TaskIcon';
import { useToast } from '@/components/toast';
import { GAME_COLORS, GAME_SHADOWS, sxCard } from '@/theme/gameTheme';

type ItemResponseDto = components['schemas']['ItemResponseDto'];

const UNIT_LABEL: Record<string, string> = {
  count: '',
  minutes: 'min',
};

interface ItemCardProps extends ItemResponseDto {
  index?: number;
}

export default function ItemCard({
  id,
  name,
  desc,
  icon,
  amount,
  amountUnit,
  index = 0,
}: ItemCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteItem = $api.useMutation('delete', '/items/{id}', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/items').queryKey,
      });
      toast.success('Item deleted');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  const handleDelete = () => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    deleteItem.mutate({ params: { path: { id } } });
  };

  const unitLabel = UNIT_LABEL[amountUnit];
  const amountDisplay =
    amountUnit === 'count' && amount === 1
      ? null
      : `${amount}${unitLabel ? ` ${unitLabel}` : ''}`;

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
        '&:hover .item-action-btn': { opacity: 1 },
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
          <TaskIcon name={icon} />
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
            {name}
          </Typography>
          {desc && (
            <Typography
              sx={{ fontSize: '0.8rem', color: GAME_COLORS.textSecondary }}
            >
              {desc}
            </Typography>
          )}
          <Typography
            sx={{ fontSize: '0.75rem', color: GAME_COLORS.textSecondary }}
          >
            {amountDisplay ?? `1 ${amountUnit}`}
          </Typography>
        </Box>

        <IconButton
          className="item-action-btn"
          size="small"
          onClick={() => navigate(`/items/${id}/edit`)}
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: GAME_COLORS.textMuted,
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          className="item-action-btn"
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
