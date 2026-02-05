import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';

interface Block {
  id: number;
  amount?: number | null;
  xpReward: number;
  coinReward: number;
}

export interface TaskItemProps {
  id: number;
  name: string;
  desc?: string | null;
  icon?: string | null;
  amountUnit?: string | null;
  blocks: Block[];
  userId: number;
}

/** Renders a single task row with icon, name, and reward chips. Handles its own completion flow. */
export default function TaskItem({
  id,
  name,
  desc,
  icon,
  amountUnit,
  blocks,
  userId,
}: TaskItemProps) {
  const navigate = useNavigate();
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
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/users').queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/users/{id}', {
          params: { path: { id: userId } },
        }).queryKey,
      });
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

  // Asks for confirmation, then sends the complete request.
  const handleClick = () => {
    if (!window.confirm(`Complete "${name}"?`)) return;
    completeTask.mutate({
      params: { path: { id } },
      body: { userId },
    });
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        p: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ fontSize: 24 }}>{icon ?? '📋'}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
            {name}
          </Typography>
          {desc && (
            <Typography variant="body2" color="text.secondary">
              {desc}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={() => navigate(`/tasks/${id}/edit`)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        {blocks.map((block) => (
          <Button
            key={block.id}
            variant="outlined"
            onClick={() => {}}
            sx={{
              textTransform: 'none',
              flexDirection: 'column',
              py: 1,
              px: 2,
            }}
          >
            <Typography variant="subtitle2">
              {amountUnit === 'minutes' && block.amount != null
                ? `${block.amount} min`
                : '1 count'}
            </Typography>
            <Typography variant="caption">
              ⭐ {block.xpReward} XP &nbsp; 🪙 {block.coinReward}
            </Typography>
          </Button>
        ))}
      </Stack>

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
    </Box>
  );
}
