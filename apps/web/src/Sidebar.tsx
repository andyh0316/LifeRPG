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
import LogoutIcon from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import { Link } from 'react-router-dom';
import { api } from '@life-rpg/api-client';
import ProfileCard from './components/ProfileCard';

const DRAWER_WIDTH = 240;

export { DRAWER_WIDTH };

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const handleLogout = async () => {
    await api.POST('/auth/logout');
    localStorage.removeItem('accessTokenExpiresAt');
    localStorage.removeItem('refreshTokenExpiresAt');
    onLogout();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6">LifeRPG</Typography>
      </Toolbar>
      <ProfileCard />
      <Divider />
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
      <List sx={{ mt: 'auto' }}>
        <Divider />
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
