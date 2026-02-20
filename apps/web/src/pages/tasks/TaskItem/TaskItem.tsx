import { GAME_COLORS, GAME_SHADOWS, sxCard } from '@/theme/gameTheme';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { $api } from '@life-rpg/api-client';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskIcon from '../../../components/icons/TaskIcon';
import { useToast } from '../../../components/toast';
import playClickSound from '../../../utils/playClickSound';
import playSuccessSound from '../../../utils/playSuccessSound';
import BlockButton from './BlockButton';
import CompletionDialog from './CompletionDialog';
import type { Block, TaskItemProps } from './types';

const PERIOD_LABEL: Record<string, string> = {
  'day-long': 'today',
  'week-long': 'this week',
  'month-long': 'this month',
};

export default function TaskItem({
  id,
  name,
  desc,
  icon,
  amountUnit,
  goalAmount,
  goalPeriod,
  goalCompletedAmount,
  currentStreak,
  blocks,
  userCharacterId,
  index = 0,
  forDate,
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
        queryKey: $api.queryOptions('get', '/user-character/summary').queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/user-character/goals/progress')
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/tasks').queryKey,
      });
      playSuccessSound();
      setCompleted(true);
      setEarnedCoins(data.coinsEarned);
      toast.success(
        `Task completed! +${data.xpEarned.toLocaleString()} XP, +${data.coinsEarned.toLocaleString()} gold`,
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
  const [completed, setCompleted] = useState(false);
  const [preCompletionXp, setPreCompletionXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const { data: progress } = $api.useQuery(
    'get',
    '/user-character/goals/progress',
  );

  const handleBlockClick = (block: Block) => {
    playClickSound();
    setCompleted(false);
    setConfirmBlock(block);
  };

  const handleConfirm = () => {
    if (!confirmBlock) return;
    setPreCompletionXp(progress?.daily.current ?? 0);
    const [y, m, d] = forDate.split('-').map(Number);
    const now = new Date();
    const completedAt = new Date(
      y,
      m - 1,
      d,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    ).toISOString();
    completeBlock.mutate({
      body: { blockId: confirmBlock.id, completedAt },
    });
  };

  const handleCloseDialog = () => {
    setConfirmBlock(null);
    setCompleted(false);
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    deleteTask.mutate({ params: { path: { id } } });
  };

  const dailyProgress = progress?.daily;

  const goalPercent =
    goalAmount && goalAmount > 0
      ? Math.min(100, ((goalCompletedAmount ?? 0) / goalAmount) * 100)
      : 0;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        ...sxCard,
        mb: 1.5,
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideUpFadeIn 0.3s ease forwards',
        animationDelay: `${index * 0.04}s`,
        opacity: 0,
        '&:hover': {
          boxShadow: GAME_SHADOWS.cardHover,
          transform: 'translateY(-1px)',
        },
        '&:hover .quest-edit-btn': { opacity: 1 },
        ...(goalPercent >= 100 && {
          border: '1px solid #4caf50',
          boxShadow: '0 0 8px rgba(76, 175, 80, 0.3)',
        }),
        ...(goalPercent > 0 && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            height: 3,
            width: `${goalPercent}%`,
            bgcolor: '#4caf50',
            transition: 'width 0.4s ease',
          },
        }),
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
          <Typography
            sx={{ fontSize: '0.8rem', color: GAME_COLORS.textSecondary }}
          >
            {goalCompletedAmount ?? 0}
            {goalAmount != null && ` / ${goalAmount}`} {amountUnit}{' '}
            {goalPeriod && PERIOD_LABEL[goalPeriod]}
            {currentStreak != null && currentStreak >= 2 && (
              <Typography
                component="span"
                sx={{ fontSize: '0.8rem', color: '#ef6c00', ml: 1 }}
              >
                🔥 {currentStreak}
              </Typography>
            )}
          </Typography>
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
          <BlockButton
            key={block.id}
            block={block}
            amountUnit={amountUnit}
            onClick={handleBlockClick}
          />
        ))}
      </Stack>

      <CompletionDialog
        name={name}
        amountUnit={amountUnit}
        confirmBlock={confirmBlock}
        completed={completed}
        isPending={completeBlock.isPending}
        progress={dailyProgress}
        preCompletionXp={preCompletionXp}
        earnedCoins={earnedCoins}
        onConfirm={handleConfirm}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}
