import { useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import UndoIcon from '@mui/icons-material/Undo';

interface TaskListMenuProps {
  onUndo: () => void;
  undoPending: boolean;
  onNewQuest: () => void;
  onGoals: () => void;
  editing: boolean;
  onToggleEdit: () => void;
}

export default function TaskListMenu({
  onUndo,
  undoPending,
  onNewQuest,
  onGoals,
  editing,
  onToggleEdit,
}: TaskListMenuProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);

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

            <MenuItem onClick={closeAndRun(onToggleEdit)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{editing ? 'Done' : 'Edit'}</ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Popper>
    </>
  );
}
