import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export interface TaskItemProps {
  id: number;
  name: string;
  description?: string | null;
  xpReward: number;
  coinReward: number;
  icon?: string | null;
  onClick: (taskId: number) => void;
}

/** Renders a single task row with icon, name, and reward chips. */
export default function TaskItem({
  id,
  name,
  description,
  xpReward,
  coinReward,
  icon,
  onClick,
}: TaskItemProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={() => onClick(id)}>
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
    </ListItem>
  );
}
