import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';
import TaskIcon from '../../components/icons/TaskIcon';
import { useToast } from '../../components/toast';
import playClickSound from '../../utils/playClickSound';
import playSuccessSound from '../../utils/playSuccessSound';
import {
  GAME_COLORS,
  GAME_SHADOWS,
  GAME_RADII,
  sxCard,
} from '@/theme/gameTheme';

interface Block {
  id: number;
  sortOrder: number;
  amount: number;
  xpReward: number;
  coinReward: number;
}

export interface TaskItemProps {
  id: number;
  name: string;
  desc?: string | null;
  icon?: string | null;
  amountUnit: string;
  blocks: Block[];
  userId: number;
  index?: number;
}

export default function TaskItem({
  id,
  name,
  desc,
  icon,
  amountUnit,
  blocks,
  userId,
  index = 0,
}: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? 'none'
      : transition
        ? `${transition}, box-shadow 0.2s ease`
        : 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const completeBlock = $api.useMutation('post', '/task-completions', {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/users').queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/users/{id}', {
          params: { path: { id: userId } },
        }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/user-character/goals/progress')
          .queryKey,
      });
      playSuccessSound();
      toast.success(
        `Task completed! +${data.xpEarned} XP, +${data.coinsEarned} gold`,
      );
    },
    onError: () => {
      toast.error('Failed to complete task');
    },
  });

  const deleteTask = $api.useMutation('delete', '/tasks/{id}', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/tasks').queryKey,
      });
      toast.success('Task deleted');
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });

  const [confirmBlock, setConfirmBlock] = useState<Block | null>(null);

  const handleBlockClick = (block: Block) => {
    playClickSound();
    setConfirmBlock(block);
  };

  const handleConfirm = () => {
    if (!confirmBlock) return;
    completeBlock.mutate({ body: { blockId: confirmBlock.id } });
    setConfirmBlock(null);
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    deleteTask.mutate({ params: { path: { id } } });
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
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
        '&:hover .quest-edit-btn': { opacity: 1 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
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
        </Box>

        <IconButton
          className="quest-edit-btn"
          size="small"
          onClick={() => navigate(`/tasks/${id}/edit`)}
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: GAME_COLORS.textMuted,
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          className="quest-edit-btn"
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
        <Box
          {...attributes}
          {...listeners}
          className="quest-edit-btn"
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            color: GAME_COLORS.textMuted,
            opacity: 0,
            transition: 'opacity 0.15s ease',
            flexShrink: 0,
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
        {blocks.map((block) => (
          <Button
            key={block.id}
            variant="text"
            onClick={() => handleBlockClick(block)}
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
                {block.coinReward} G
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  color: GAME_COLORS.xpGreen,
                }}
              >
                {block.xpReward} XP
              </Typography>
            </Box>
          </Button>
        ))}
      </Stack>

      <Dialog
        open={!!confirmBlock}
        onClose={() => setConfirmBlock(null)}
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

        {confirmBlock && (
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: GAME_COLORS.textSecondary,
              mb: 3,
            }}
          >
            {confirmBlock.amount} {amountUnit === 'minutes' ? 'min' : 'count'}{' '}
            &middot;{' '}
            <span style={{ color: GAME_COLORS.coinGold }}>
              {confirmBlock.coinReward} G
            </span>{' '}
            &middot;{' '}
            <span style={{ color: GAME_COLORS.xpGreen }}>
              {confirmBlock.xpReward} XP
            </span>
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleConfirm}
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
      </Dialog>
    </Box>
  );
}
