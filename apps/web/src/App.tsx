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
import Rewards from './pages/rewards/Rewards';
import Login from './pages/login/Login';

function App() {
  // Auth gate: checks if user is authenticated via access_token cookie.
  // Called on mount, window refocus, and network reconnect.
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading,
    error,
    refetch,
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
        <Login
          onLogin={() => {
            refetch();
          }}
        />
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar onLogout={() => queryClient.resetQueries()} />
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/create" element={<CreateTask />} />
          <Route path="/tasks/:id/edit" element={<EditTask />} />
          <Route path="/rewards" element={<Rewards />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
