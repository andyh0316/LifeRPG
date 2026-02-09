import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
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
  GAME_SHADOWS,
  sxPageTitle,
  sxAccentButton,
  sxOutlinedButton,
} from '@/theme/gameTheme';
import TaskItem from '../TaskItem';

export default function TaskList() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: tasks = [] } = $api.useQuery('get', '/tasks');
  const { data: users = [] } = $api.useQuery('get', '/users');
  const userId = users[0]?.id;

  const [goalsOpen, setGoalsOpen] = useState(false);

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
            {userId &&
              tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  {...task}
                  userId={userId}
                  index={index}
                />
              ))}
          </List>
        </SortableContext>
      </DndContext>

      <GoalsEditDialog open={goalsOpen} onClose={() => setGoalsOpen(false)} />
    </>
  );
}
