import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import { Routes, Route } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@life-rpg/api-client';
import Sidebar from './Sidebar';
import Home from './pages/home/Home';
import Tasks from './pages/tasks/Tasks';
import CreateTask from './pages/tasks/CreateTask';
import EditTask from './pages/tasks/EditTask';
import Items from './pages/items/Items';
import CreateItem from './pages/items/CreateItem';
import EditItem from './pages/items/EditItem';
import PickIcon from './pages/items/PickIcon';
import Shop from './pages/shop/Shop';
import CreateShopListing from './pages/shop/CreateShopListing';
import EditShopListing from './pages/shop/EditShopListing';
import Inventory from './pages/inventory/Inventory';
import Login from './pages/login/Login';
import { GAME_COLORS } from '@/theme/gameTheme';

function App() {
  // Auth gate: checks if user is authenticated via access_token cookie.
  // Called on mount, window refocus, and network reconnect.
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading,
    error,
  } = $api.useQuery('get', '/auth/me', {}, { retry: false });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CssBaseline />
        <CircularProgress />
      </Box>
    );
  }

  if (!user || error) {
    return (
      <>
        <CssBaseline />
        <Login />
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar onLogout={() => queryClient.resetQueries()} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: GAME_COLORS.pageBg,
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/create" element={<CreateTask />} />
          <Route path="/tasks/:id/edit" element={<EditTask />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/create" element={<CreateItem />} />
          <Route path="/items/:id/edit" element={<EditItem />} />
          <Route path="/items/pick-icon" element={<PickIcon />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/create" element={<CreateShopListing />} />
          <Route path="/shop/:id/edit" element={<EditShopListing />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
