import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Home from './pages/Home';
import Earnings from './pages/Earnings';
import Rewards from './pages/Rewards';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/rewards" element={<Rewards />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
