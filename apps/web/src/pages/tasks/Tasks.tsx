import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { $api } from '@life-rpg/api-client';
import TaskList from './TaskList';
import CompletionOverview from './CompletionOverview';

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const { isLoading } = $api.useQuery('get', '/tasks');

  if (isLoading) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 48px)' }}>
      {/* Left panel – Tasks */}
      <Box sx={{ flex: 1, overflowY: 'auto', maxWidth: 600 }}>
        <TaskList />
      </Box>

      {/* Right panel – Completion overview */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <CompletionOverview />
      </Box>
    </Box>
  );
}
