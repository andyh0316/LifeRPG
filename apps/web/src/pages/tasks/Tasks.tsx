import { useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { $api } from '@life-rpg/api-client';
import TaskList from './TaskList';
import CompletionOverview from './CompletionOverview';

function computeReferenceTime(baseNow: Date, dayOffset: number): string {
  const d = new Date(baseNow);
  d.setDate(d.getDate() - dayOffset);
  return d.toISOString();
}

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const [baseNow] = useState(() => new Date());
  const [dayOffset, setDayOffset] = useState(0);
  const referenceTime = useMemo(
    () => computeReferenceTime(baseNow, dayOffset),
    [baseNow, dayOffset],
  );

  const { isLoading } = $api.useQuery('get', '/tasks', {
    params: { query: { referenceTime } },
  });

  if (isLoading) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 48px)' }}>
      {/* Left panel – Tasks */}
      <Box sx={{ flex: 1, overflowY: 'auto', maxWidth: 600 }}>
        <TaskList
          referenceTime={referenceTime}
          dayOffset={dayOffset}
          onDayOffsetChange={setDayOffset}
        />
      </Box>

      {/* Right panel – Completion overview */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <CompletionOverview />
      </Box>
    </Box>
  );
}
