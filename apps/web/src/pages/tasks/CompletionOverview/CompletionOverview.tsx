import { Fragment, useCallback, useMemo, useState } from 'react';
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
const COL_DATE = 150;
const COL_WEEKLY_XP = 150;
const COL_TASK = 100;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${dateStr} (${DAYS[d.getDay()]})`;
}

// Returns ISO week key (YYYY-WW) for grouping days into Mon–Sun weeks
function getIsoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  // Adjust to Monday-based: Mon=0 … Sun=6
  const mondayOffset = (day + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - mondayOffset);
  // ISO week number: Thursday of that week determines the year/week
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const jan1 = new Date(thursday.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((thursday.getTime() - jan1.getTime()) / 86400000 + 1) / 7,
  );
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

interface WeekGroup {
  weekKey: string;
  startIndex: number; // index in the days array where this week starts
  count: number; // number of days in this group
  totals: number[]; // per-task weekly totals (same order as tasks array)
  weeklyXp: number; // total XP earned in this week
}

function buildWeekGroups(days: TaskLogDay[], taskCount: number): WeekGroup[] {
  if (days.length === 0) return [];

  const groups: WeekGroup[] = [];
  let currentKey = getIsoWeekKey(days[0].date);
  let startIndex = 0;
  let totals = new Array<number>(taskCount).fill(0);
  let weeklyXp = 0;

  for (let i = 0; i < days.length; i++) {
    const key = getIsoWeekKey(days[i].date);
    if (key !== currentKey) {
      groups.push({
        weekKey: currentKey,
        startIndex,
        count: i - startIndex,
        totals,
        weeklyXp,
      });
      currentKey = key;
      startIndex = i;
      totals = new Array<number>(taskCount).fill(0);
      weeklyXp = 0;
    }
    for (let t = 0; t < taskCount; t++) {
      totals[t] += days[i].completions[t] ?? 0;
    }
    weeklyXp += days[i].totalXp;
  }
  groups.push({
    weekKey: currentKey,
    startIndex,
    count: days.length - startIndex,
    totals,
    weeklyXp,
  });

  return groups;
}

// Maps each day index to its week group index
function buildDayToWeekMap(groups: WeekGroup[]): number[] {
  const map: number[] = [];
  for (let g = 0; g < groups.length; g++) {
    for (let d = 0; d < groups[g].count; d++) {
      map.push(g);
    }
  }
  return map;
}

function ProgressBar({
  total,
  goal,
  direction,
  label,
  sublabel,
}: {
  total: number;
  goal: number;
  direction: 'horizontal' | 'vertical';
  label: string;
  sublabel?: string;
}) {
  const pct = goal > 0 ? Math.min(total / goal, 1) : 0;
  const met = goal > 0 && total >= goal;
  const isHorizontal = direction === 'horizontal';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        bgcolor: GAME_COLORS.progressTrack,
        overflow: 'hidden',
      }}
    >
      {/* Fill */}
      <Box
        sx={{
          position: 'absolute',
          ...(isHorizontal
            ? { left: 0, top: 0, height: '100%', width: `${pct * 100}%` }
            : { bottom: 0, left: 0, width: '100%', height: `${pct * 100}%` }),
          bgcolor: met ? 'rgba(34,197,94,0.35)' : 'rgba(34,197,94,0.18)',
          transition: isHorizontal ? 'width 0.3s ease' : 'height 0.3s ease',
        }}
      />
      {/* Label */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: met ? 800 : 600,
            fontSize: '0.7rem',
            color: met ? '#15803d' : GAME_COLORS.textSecondary,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
        {sublabel && (
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6rem',
              color: GAME_COLORS.textMuted,
              lineHeight: 1,
            }}
          >
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
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
  const weeklyXpTarget = data?.goalsProgress?.weekly?.target ?? 0;

  const weekGroups = useMemo(
    () => buildWeekGroups(days, tasks.length),
    [days, tasks.length],
  );
  const dayToWeek = useMemo(() => buildDayToWeekMap(weekGroups), [weekGroups]);

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
            <Table
              size="small"
              sx={{
                tableLayout: 'fixed',
                width: COL_DATE + COL_WEEKLY_XP + tasks.length * COL_TASK,
                borderCollapse: 'collapse',
                '& td, & th': {
                  border: `1px solid ${GAME_COLORS.textMuted}`,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: GAME_COLORS.textSecondary,
                      width: COL_DATE,
                      minWidth: COL_DATE,
                      maxWidth: COL_DATE,
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: GAME_COLORS.textSecondary,
                      width: COL_WEEKLY_XP,
                      minWidth: COL_WEEKLY_XP,
                      maxWidth: COL_WEEKLY_XP,
                    }}
                  >
                    Weekly XP
                  </TableCell>
                  {tasks.map((task) => (
                    <TableCell
                      key={task.taskId}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: GAME_COLORS.textSecondary,
                        width: COL_TASK,
                        minWidth: COL_TASK,
                        maxWidth: COL_TASK,
                      }}
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
                {days.map((day, dayIndex) => {
                  const groupIndex = dayToWeek[dayIndex];
                  const group = weekGroups[groupIndex];
                  const isFirstInGroup = dayIndex === group.startIndex;

                  return (
                    <TableRow key={day.date}>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          width: COL_DATE,
                          minWidth: COL_DATE,
                          maxWidth: COL_DATE,
                        }}
                      >
                        {formatDate(day.date)}
                      </TableCell>
                      {isFirstInGroup && (
                        <TableCell
                          rowSpan={group.count}
                          sx={{
                            p: 0,
                            height: '1px',
                            width: COL_WEEKLY_XP,
                            minWidth: COL_WEEKLY_XP,
                            maxWidth: COL_WEEKLY_XP,
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              height: '100%',
                            }}
                          >
                            <Box sx={{ position: 'absolute', inset: 0 }}>
                              <ProgressBar
                                total={group.weeklyXp}
                                goal={weeklyXpTarget}
                                direction="vertical"
                                label={
                                  weeklyXpTarget > 0
                                    ? `${group.weeklyXp} / ${weeklyXpTarget}`
                                    : `${group.weeklyXp}`
                                }
                              />
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      {tasks.map((task, taskIndex) => {
                        const isWeekly = task.goalPeriod === 'week-long';
                        const goal = task.goalAmount ?? 0;

                        if (isWeekly) {
                          if (!isFirstInGroup)
                            return <Fragment key={task.taskId} />;
                          const weekTotal = group.totals[taskIndex];
                          return (
                            <TableCell
                              key={task.taskId}
                              rowSpan={group.count}
                              sx={{
                                p: 0,
                                height: '1px',
                                width: COL_TASK,
                                minWidth: COL_TASK,
                                maxWidth: COL_TASK,
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'relative',
                                  height: '100%',
                                }}
                              >
                                <Box sx={{ position: 'absolute', inset: 0 }}>
                                  <ProgressBar
                                    total={weekTotal}
                                    goal={goal}
                                    direction="vertical"
                                    label={`${weekTotal} / ${goal}`}
                                    sublabel={task.goalPeriod ?? undefined}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                          );
                        }

                        const amount = day.completions[taskIndex] ?? 0;
                        return (
                          <TableCell
                            key={task.taskId}
                            sx={{
                              p: 0,
                              height: '1px',
                              width: COL_TASK,
                              minWidth: COL_TASK,
                              maxWidth: COL_TASK,
                            }}
                          >
                            <ProgressBar
                              total={amount}
                              goal={goal}
                              direction="horizontal"
                              label={
                                goal > 0 ? `${amount} / ${goal}` : `${amount}`
                              }
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
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
