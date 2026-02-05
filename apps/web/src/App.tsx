import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Home from './pages/home/Home';
import Tasks from './pages/tasks/Tasks';
import CreateTask from './pages/tasks/CreateTask';
import EditTask from './pages/tasks/EditTask';
import Rewards from './pages/rewards/Rewards';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
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
