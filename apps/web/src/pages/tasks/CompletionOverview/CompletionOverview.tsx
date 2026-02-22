import { useCallback, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from '@tanstack/react-query';
import { $api, api } from '@life-rpg/api-client';
import type { components } from '@life-rpg/api-client';
import { sxPageTitle, GAME_COLORS } from '@/theme/gameTheme';
import TaskIcon from '@/components/icons/TaskIcon';

type TaskLogTask = components['schemas']['TaskLogTaskDto'];
type TaskLogDay = components['schemas']['TaskLogDayEntryDto'];

const PAGE_SIZE = 30;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${dateStr} (${DAYS[d.getDay()]})`;
}

export default function CompletionOverview() {
  const [extraDays, setExtraDays] = useState<TaskLogDay[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const queryClient = useQueryClient();

  const { data } = $api.useQuery('get', '/task-log', {
    params: { query: { pageSize: PAGE_SIZE } },
  });

  const tasks: TaskLogTask[] = data?.tasks ?? [];
  const days: TaskLogDay[] = [...(data?.days ?? []), ...extraDays];
  const nextCursor = extraDays.length > 0 ? cursor : data?.nextCursor;

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    const { data: page } = await api.GET('/task-log', {
      params: { query: { pageSize: PAGE_SIZE, cursor: nextCursor } },
    });
    if (page) {
      setExtraDays((prev) => [...prev, ...page.days]);
      setCursor(page.nextCursor);
    }
    setLoadingMore(false);
  }, [nextCursor]);

  const handleRefresh = useCallback(() => {
    setExtraDays([]);
    setCursor(undefined);
    queryClient.invalidateQueries({
      queryKey: $api.queryOptions('get', '/task-log').queryKey,
    });
  }, [queryClient]);

  if (!data) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={sxPageTitle}>Task Log</Typography>
        <IconButton size="small" onClick={handleRefresh}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      {tasks.length === 0 ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
          No tasks yet.
        </Typography>
      ) : (
        <>
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 700, color: GAME_COLORS.textSecondary }}
                  >
                    Date
                  </TableCell>
                  {tasks.map((task) => (
                    <TableCell
                      key={task.taskId}
                      align="center"
                      sx={{ fontWeight: 700, color: GAME_COLORS.textSecondary }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.25,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <TaskIcon name={task.taskIcon} fontSize="small" />
                          {task.taskName}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: GAME_COLORS.textMuted }}
                        >
                          ({task.amountUnit})
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {days.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatDate(day.date)}
                    </TableCell>
                    {day.completions.map((amount, i) => (
                      <TableCell
                        key={tasks[i]?.taskId}
                        align="center"
                        sx={{
                          color:
                            amount === 0
                              ? 'text.disabled'
                              : GAME_COLORS.textPrimary,
                          fontWeight: amount > 0 ? 600 : 400,
                        }}
                      >
                        {amount}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {nextCursor && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
