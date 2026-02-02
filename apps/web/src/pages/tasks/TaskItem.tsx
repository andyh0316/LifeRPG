import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';

export interface TaskItemProps {
  id: number;
  name: string;
  description?: string | null;
  xpReward: number;
  coinReward: number;
  icon?: string | null;
  userId: string;
}

/** Renders a single task row with icon, name, and reward chips. Handles its own completion flow. */
export default function TaskItem({
  id,
  name,
  description,
  xpReward,
  coinReward,
  icon,
  userId,
}: TaskItemProps) {
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Completes this task for the given user.
  const completeTask = $api.useMutation('post', '/tasks/{id}/complete', {
    onSuccess: (data) => {
      // Refetch user data so the profile card reflects updated XP/coins
      queryClient.invalidateQueries({ queryKey: $api.queryOptions('get', '/users').queryKey });
      queryClient.invalidateQueries({ queryKey: $api.queryOptions('get', '/users/{id}', { params: { path: { id: userId } } }).queryKey });
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

  // Sends the complete request for this task.
  const handleClick = () => {
    completeTask.mutate({
      params: { path: { id } },
      body: { userId },
    });
  };

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon sx={{ minWidth: 40, fontSize: 24 }}>
          {icon ?? '📋'}
        </ListItemIcon>
        <ListItemText primary={name} secondary={description} />
        {/* Reward chips */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<StarIcon />}
            label={`${xpReward} XP`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<MonetizationOnIcon />}
            label={`${coinReward}`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Box>
      </ListItemButton>

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
    </ListItem>
  );
}
