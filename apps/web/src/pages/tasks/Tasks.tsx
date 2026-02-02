import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
import { $api } from '@life-rpg/api-client';
import TaskItem from './TaskItem';

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const { data: tasks = [], isLoading } = $api.useQuery('get', '/tasks');
  const { data: users = [] } = $api.useQuery('get', '/users');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Completes a task for the first available user.
  const completeTask = $api.useMutation('post', '/tasks/{id}/complete', {
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: `Task completed! +${data.xpEarned} XP, +${data.coinsEarned} coins`,
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Failed to complete task',
        severity: 'error',
      });
    },
  });

  // Sends the complete request using the first user's ID.
  const handleTaskClick = (taskId: number) => {
    const userId = users[0]?.id;
    if (!userId) return;
    completeTask.mutate({
      params: { path: { id: taskId } },
      body: { userId },
    });
  };

  if (isLoading) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <List>
        {tasks.map((task) => (
          <TaskItem key={task.id} {...task} onClick={handleTaskClick} />
        ))}
      </List>

      {/* Feedback snackbar for task completion */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
