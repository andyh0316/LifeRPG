import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import TaskList from './TaskList';
import CompletionOverview from './CompletionOverview';

function computeForDate(baseNow: Date, dayOffset: number): string {
  const d = new Date(baseNow);
  d.setDate(d.getDate() - dayOffset);
  return d.toLocaleDateString('en-CA');
}

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const [baseNow] = useState(() => new Date());
  const [dayOffset, setDayOffset] = useState(0);
  const forDate = useMemo(
    () => computeForDate(baseNow, dayOffset),
    [baseNow, dayOffset],
  );

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 48px)' }}>
      {/* Left panel – Tasks */}
      <Box sx={{ flex: 1, overflowY: 'auto', maxWidth: 600 }}>
        <TaskList
          forDate={forDate}
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
