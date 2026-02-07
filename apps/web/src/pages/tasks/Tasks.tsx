import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
import { useLocation, useNavigate } from 'react-router-dom';
import { $api } from '@life-rpg/api-client';
import TaskItem from './TaskItem';

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: tasks = [], isLoading } = $api.useQuery('get', '/tasks');
  const { data: users = [] } = $api.useQuery('get', '/users');
  const userId = users[0]?.id;

  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { flash?: string } | null;
    if (state?.flash) {
      setFlash(state.flash);
      // Clear the state so it doesn't re-show on refresh
      window.history.replaceState({}, '');
    }
  }, [location.state]);

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
      </Box>
      <List>
        {userId &&
          tasks.map((task) => (
            <TaskItem key={task.id} {...task} userId={userId} />
          ))}
      </List>

      <Snackbar
        open={flash != null}
        autoHideDuration={3000}
        onClose={() => setFlash(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      </Snackbar>
    </>
  );
}
