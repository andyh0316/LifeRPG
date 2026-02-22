import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLocation, useNavigate } from 'react-router-dom';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
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
import { GAME_COLORS, sxPageTitle } from '@/theme/gameTheme';
import TaskItem from '../TaskItem';
import TaskListMenu from './TaskListMenu';

interface TaskListProps {
  forDate: string;
  dayOffset: number;
  onDayOffsetChange: (offset: number) => void;
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
    placeholderData: keepPreviousData,
  });

  const [goalsOpen, setGoalsOpen] = useState(false);
  const [editing, setEditing] = useState(false);

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

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography sx={{ ...sxPageTitle, flex: 1 }}>Quests</Typography>

        <DateNav
          forDate={forDate}
          dayOffset={dayOffset}
          onDayOffsetChange={onDayOffsetChange}
        />

        <TaskListMenu
          onUndo={() => undoCompletion.mutate({})}
          undoPending={undoCompletion.isPending}
          onNewQuest={() => navigate('/tasks/create')}
          onGoals={() => setGoalsOpen(true)}
          editing={editing}
          onToggleEdit={() => setEditing((v) => !v)}
        />
      </Box>

      <GoalsProgress forDate={forDate} />

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
                goalCompletedAmount={task.goalCompletedAmount ?? 0}
                index={index}
                forDate={forDate}
                editing={editing}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>

      <GoalsEditDialog open={goalsOpen} onClose={() => setGoalsOpen(false)} />
    </>
  );
}

function formatDateLabel(forDate: string): string {
  return new Date(forDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function DateNav({
  forDate,
  dayOffset,
  onDayOffsetChange,
}: {
  forDate: string;
  dayOffset: number;
  onDayOffsetChange: (offset: number) => void;
}) {
  const isToday = dayOffset === 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton size="small" onClick={() => onDayOffsetChange(dayOffset + 1)}>
        <ChevronLeftIcon fontSize="small" />
      </IconButton>
      <Typography
        sx={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: isToday ? GAME_COLORS.textSecondary : GAME_COLORS.accent,
          cursor: isToday ? 'default' : 'pointer',
          userSelect: 'none',
          minWidth: 100,
          textAlign: 'center',
        }}
        onClick={() => !isToday && onDayOffsetChange(0)}
      >
        {formatDateLabel(forDate)}
      </Typography>
      <IconButton
        size="small"
        disabled={isToday}
        onClick={() => onDayOffsetChange(dayOffset - 1)}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
