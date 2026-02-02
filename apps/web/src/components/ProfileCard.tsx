import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { $api } from '@life-rpg/api-client';

const XP_TO_NEXT_LEVEL = 500;

/** Displays the current user's profile summary with level and XP progress. */
export default function ProfileCard() {
  // Fetch the user list to get the first user's ID.
  const { data: users = [] } = $api.useQuery('get', '/users');
  const userId = users[0]?.id;

  // Fetch the full profile for the first user.
  const { data: profile } = $api.useQuery('get', '/users/{id}', {
    params: { path: { id: userId! } },
  }, { enabled: !!userId });

  if (!profile) return null;

  // XP progress as a percentage toward the next level.
  const progress = (profile.xp / XP_TO_NEXT_LEVEL) * 100;

  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1 }}>
        {profile.fullName.charAt(0).toUpperCase()}
      </Avatar>
      <Typography variant="subtitle1" fontWeight="bold">
        {profile.fullName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Level {profile.level}
      </Typography>

      {/* Coin balance */}
      <Chip
        icon={<MonetizationOnIcon />}
        label={profile.coins}
        size="small"
        color="warning"
        variant="outlined"
        sx={{ mt: 1 }}
      />

      {/* XP progress bar */}
      <Box sx={{ mt: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">XP</Typography>
          <Typography variant="caption">
            {profile.xp} / {XP_TO_NEXT_LEVEL}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    </Box>
  );
}
