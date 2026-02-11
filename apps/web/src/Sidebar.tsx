import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation } from 'react-router-dom';
import { api } from '@life-rpg/api-client';
import ProfileCard from './components/ProfileCard';
import { GAME_COLORS } from '@/theme/gameTheme';

const DRAWER_WIDTH = 240;

export { DRAWER_WIDTH };

interface SidebarProps {
  onLogout: () => void;
}

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, to: '/' },
  { label: 'Quests', icon: <TaskAltIcon />, to: '/tasks' },
  { label: 'Items', icon: <Inventory2Icon />, to: '/items' },
  { label: 'Shop', icon: <StorefrontIcon />, to: '/shop' },
  { label: 'Rewards', icon: <EmojiEventsIcon />, to: '/rewards' },
];

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  const handleLogout = async () => {
    await api.POST('/auth/logout');
    localStorage.removeItem('tokenExpiresAt');
    onLogout();
  };

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

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
          bgcolor: GAME_COLORS.sidebarBg,
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
        >
          Life
          <Box component="span" sx={{ color: GAME_COLORS.accent }}>
            RPG
          </Box>
        </Typography>
      </Box>

      <ProfileCard />

      <List sx={{ px: 1, mt: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                color: active ? '#fff' : GAME_COLORS.sidebarTextMuted,
                bgcolor: active ? GAME_COLORS.sidebarActive : 'transparent',
                borderLeft: active
                  ? `3px solid ${GAME_COLORS.sidebarActiveBorder}`
                  : '3px solid transparent',
                '&:hover': {
                  bgcolor: active
                    ? GAME_COLORS.sidebarActive
                    : GAME_COLORS.sidebarHover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: active
                    ? GAME_COLORS.accent
                    : GAME_COLORS.sidebarTextMuted,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.9rem',
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <List sx={{ mt: 'auto', px: 1, pb: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            color: GAME_COLORS.sidebarTextMuted,
            '&:hover': { bgcolor: GAME_COLORS.sidebarHover },
          }}
        >
          <ListItemIcon
            sx={{ minWidth: 32, color: GAME_COLORS.sidebarTextMuted }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            slotProps={{ primary: { fontSize: '0.9rem' } }}
          />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
