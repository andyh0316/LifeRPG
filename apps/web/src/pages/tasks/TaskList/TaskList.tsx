import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import UndoIcon from '@mui/icons-material/Undo';
import List from '@mui/material/List';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import GoalsEditDialog from '@/components/GoalsEditDialog';
import GoalsProgress from '@/components/GoalsProgress';
import { useToast } from '@/components/toast';
import {
  GAME_COLORS,
  GAME_SHADOWS,
  sxPageTitle,
  sxAccentButton,
  sxOutlinedButton,
} from '@/theme/gameTheme';
import TaskItem from '../TaskItem';

interface TaskListProps {
  forDate: string;
  dayOffset: number;
  onDayOffsetChange: (offset: number) => void;
}

function formatDateLabel(dayOffset: number, forDate: string): string {
  if (dayOffset === 0) return 'Today';
  if (dayOffset === 1) return 'Yesterday';
  return new Date(forDate + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function TaskList({
  forDate,
  dayOffset,
  onDayOffsetChange,
}: TaskListProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: tasks = [] } = $api.useQuery('get', '/tasks', {
    params: { query: { forDate } },
  });

  const [goalsOpen, setGoalsOpen] = useState(false);

  const undoCompletion = $api.useMutation('post', '/task-completions/undo', {
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
      toast.success(
        `Undid completion: -${data.xpEarned.toLocaleString()} XP, -${data.coinsEarned.toLocaleString()} gold`,
      );
    },
    onError: () => {
      toast.error('Nothing to undo');
    },
  });

  const reorder = $api.useMutation('patch', '/tasks/reorder', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/tasks').queryKey,
      });
      toast.success('Order saved');
    },
    onError: () => {
      toast.error('Failed to reorder');
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(
      $api.queryOptions('get', '/tasks').queryKey,
      reordered,
    );

    reorder.mutate({
      body: { ids: reordered.map((t) => t.id) },
    });
  };

  useEffect(() => {
    const state = location.state as { flash?: string } | null;
    if (state?.flash) {
      toast.success(state.flash);
      window.history.replaceState({}, '');
    }
  }, [location.state, toast]);

  const isToday = dayOffset === 0;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography sx={{ ...sxPageTitle, flex: 1 }}>Quests</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onDayOffsetChange(dayOffset + 1)}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: isToday ? GAME_COLORS.textSecondary : GAME_COLORS.accent,
              cursor: isToday ? 'default' : 'pointer',
              userSelect: 'none',
              minWidth: 70,
              textAlign: 'center',
            }}
            onClick={() => !isToday && onDayOffsetChange(0)}
          >
            {formatDateLabel(dayOffset, forDate)}
          </Typography>
          <IconButton
            size="small"
            disabled={isToday}
            onClick={() => onDayOffsetChange(dayOffset - 1)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        <Tooltip title="Undo last completion">
          <IconButton
            size="small"
            disabled={undoCompletion.isPending}
            onClick={() => undoCompletion.mutate({})}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/create')}
          sx={{ ...sxAccentButton, boxShadow: GAME_SHADOWS.button }}
        >
          New Quest
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<TrackChangesIcon />}
          onClick={() => setGoalsOpen(true)}
          sx={sxOutlinedButton}
        >
          Goals
        </Button>
      </Box>

      <GoalsProgress />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <List disablePadding>
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                {...task}
                index={index}
                forDate={forDate}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>

      <GoalsEditDialog open={goalsOpen} onClose={() => setGoalsOpen(false)} />
    </>
  );
}
