import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import List from '@mui/material/List';
import { useLocation, useNavigate } from 'react-router-dom';
import { $api } from '@life-rpg/api-client';
import GoalsEditDialog from '@/components/GoalsEditDialog';
import GoalsProgress from '@/components/GoalsProgress';
import { useToast } from '@/components/toast';
import {
  GAME_SHADOWS,
  sxPageTitle,
  sxAccentButton,
  sxOutlinedButton,
} from '@/theme/gameTheme';
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
    <Box sx={{ maxWidth: 600 }}>
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

      <List disablePadding>
        {userId &&
          tasks.map((task, index) => (
            <TaskItem key={task.id} {...task} userId={userId} index={index} />
          ))}
      </List>

      <GoalsEditDialog open={goalsOpen} onClose={() => setGoalsOpen(false)} />
    </Box>
  );
}
