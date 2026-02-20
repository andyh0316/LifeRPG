import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import UndoIcon from '@mui/icons-material/Undo';
import Typography from '@mui/material/Typography';
import { GAME_COLORS } from '@/theme/gameTheme';

interface TaskListMenuProps {
  forDate: string;
  dayOffset: number;
  onDayOffsetChange: (offset: number) => void;
  onUndo: () => void;
  undoPending: boolean;
  onNewQuest: () => void;
  onGoals: () => void;
}

function formatDateLabel(forDate: string): string {
  return new Date(forDate + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function TaskListMenu({
  forDate,
  dayOffset,
  onDayOffsetChange,
  onUndo,
  undoPending,
  onNewQuest,
  onGoals,
}: TaskListMenuProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const isToday = dayOffset === 0;

  const close = () => setOpen(false);
  const closeAndRun = (fn: () => void) => () => {
    fn();
    close();
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popperRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      )
        return;
      close();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <IconButton
        ref={anchorRef}
        size="small"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-end">
        <Paper ref={popperRef} elevation={8} sx={{ mt: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 1,
              py: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => onDayOffsetChange(dayOffset + 1)}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isToday ? GAME_COLORS.textSecondary : GAME_COLORS.accent,
                cursor: isToday ? 'default' : 'pointer',
                userSelect: 'none',
                minWidth: 100,
                textAlign: 'center',
              }}
              onClick={() => !isToday && onDayOffsetChange(0)}
            >
              {formatDateLabel(forDate)}
            </Typography>
            <IconButton
              size="small"
              disabled={isToday}
              onClick={() => onDayOffsetChange(dayOffset - 1)}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          <MenuList>
            <MenuItem disabled={undoPending} onClick={closeAndRun(onUndo)}>
              <ListItemIcon>
                <UndoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Undo</ListItemText>
            </MenuItem>

            <MenuItem onClick={closeAndRun(onNewQuest)}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>New Quest</ListItemText>
            </MenuItem>

            <MenuItem onClick={closeAndRun(onGoals)}>
              <ListItemIcon>
                <TrackChangesIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Goals</ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Popper>
    </>
  );
}
