import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import List from '@mui/material/List';
import { useLocation, useNavigate } from 'react-router-dom';
import { $api } from '@life-rpg/api-client';
import GoalsDialog from '@/components/GoalsDialog';
import { useToast } from '@/components/toast';
import TaskItem from './TaskItem';

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { data: tasks = [], isLoading } = $api.useQuery('get', '/tasks');
  const { data: users = [] } = $api.useQuery('get', '/users');
  const userId = users[0]?.id;

  const [goalsOpen, setGoalsOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { flash?: string } | null;
    if (state?.flash) {
      toast.success(state.flash);
      window.history.replaceState({}, '');
    }
  }, [location.state, toast]);

  if (isLoading) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tasks/create')}
        >
          Create
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<TrackChangesIcon />}
          onClick={() => setGoalsOpen(true)}
        >
          Goals
        </Button>
      </Box>
      <List>
        {userId &&
          tasks.map((task) => (
            <TaskItem key={task.id} {...task} userId={userId} />
          ))}
      </List>

      <GoalsDialog open={goalsOpen} onClose={() => setGoalsOpen(false)} />
    </>
  );
}
