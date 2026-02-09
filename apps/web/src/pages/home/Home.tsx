import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { $api } from '@life-rpg/api-client';
import { formatCountdown } from '../../utils/formatCountdown';
import { GAME_COLORS, sxPageTitle, sxCard } from '@/theme/gameTheme';

export default function Home() {
  const { data: users = [] } = $api.useQuery('get', '/users');

  const [, tick] = useState(0);
  const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');

  useEffect(() => {
    if (!tokenExpiresAt) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [tokenExpiresAt]);

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography sx={{ ...sxPageTitle, mb: 2 }}>Home</Typography>

      <Box sx={{ ...sxCard, p: 2, fontFamily: 'monospace', fontSize: 14 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8rem',
            color: GAME_COLORS.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 1,
          }}
        >
          Debug: Session Expiry
        </Typography>
        <Box sx={{ color: GAME_COLORS.textPrimary }}>
          Session Token: {formatCountdown(tokenExpiresAt)}
        </Box>
      </Box>

      {users.length > 0 && (
        <Box sx={{ ...sxCard, mt: 2, p: 2 }}>
          {users.map((user) => (
            <Typography
              key={user.id}
              sx={{
                fontSize: '0.85rem',
                color: GAME_COLORS.textSecondary,
                py: 0.25,
              }}
            >
              {user.fullName} — {user.email}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
