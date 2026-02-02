import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Link } from 'react-router-dom';

const DRAWER_WIDTH = 240;

export { DRAWER_WIDTH };

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6">LifeRPG</Typography>
      </Toolbar>
      <List>
        <ListItemButton component={Link} to="/">
          <ListItemIcon sx={{ minWidth: 32 }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton component={Link} to="/tasks">
          <ListItemIcon sx={{ minWidth: 32 }}>
            <TaskAltIcon />
          </ListItemIcon>
          <ListItemText primary="Tasks" />
        </ListItemButton>
        <ListItemButton component={Link} to="/rewards">
          <ListItemIcon sx={{ minWidth: 32 }}>
            <EmojiEventsIcon />
          </ListItemIcon>
          <ListItemText primary="Rewards" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
