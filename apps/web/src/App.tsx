import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'
import Sidebar, { DRAWER_WIDTH } from './Sidebar'

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 2, ml: `${DRAWER_WIDTH}px` }}>
        <Typography variant="h4">Home</Typography>
      </Box>
    </Box>
  )
}

export default App
