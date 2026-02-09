import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { sxPageTitle } from '@/theme/gameTheme';

export default function CompletionOverview() {
  return (
    <Box>
      <Typography sx={sxPageTitle}>Completion Overview</Typography>
      <Typography sx={{ mt: 2, color: 'text.secondary' }}>
        Task completion overview will go here.
      </Typography>
    </Box>
  );
}
