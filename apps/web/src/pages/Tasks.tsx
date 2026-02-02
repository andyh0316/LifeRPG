import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { $api } from '@life-rpg/api-client';

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const { data: tasks = [], isLoading } = $api.useQuery('get', '/tasks');

  if (isLoading) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id}>
            <ListItemIcon sx={{ minWidth: 40, fontSize: 24 }}>
              {(task.icon as unknown as string) ?? '📋'}
            </ListItemIcon>
            <ListItemText
              primary={task.name}
              secondary={task.description as unknown as string}
            />
            {/* Reward chips */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<StarIcon />}
                label={`${task.xpReward} XP`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<MonetizationOnIcon />}
                label={`${task.coinReward}`}
                size="small"
                color="warning"
                variant="outlined"
              />
            </Box>
          </ListItem>
        ))}
      </List>
    </>
  );
}
