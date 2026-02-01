import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const DRAWER_WIDTH = 240

export { DRAWER_WIDTH }

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
    </Drawer>
  )
}
