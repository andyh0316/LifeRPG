import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { $api } from '@life-rpg/api-client';
import { formatCountdown } from '../../utils/formatCountdown';

export default function Home() {
  const { data: users = [] } = $api.useQuery('get', '/users');

  const [, tick] = useState(0);
  const accessTokenExpiresAt = localStorage.getItem('accessTokenExpiresAt');
  const refreshTokenExpiresAt = localStorage.getItem('refreshTokenExpiresAt');

  useEffect(() => {
    if (!accessTokenExpiresAt && !refreshTokenExpiresAt) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [accessTokenExpiresAt, refreshTokenExpiresAt]);

  return (
    <>
      <Typography variant="h4">Home</Typography>

      <Box
        sx={{
          my: 2,
          p: 2,
          bgcolor: 'grey.100',
          borderRadius: 1,
          fontFamily: 'monospace',
          fontSize: 14,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          DEBUG: Token Expiry
        </Typography>
        <div>Access Token: {formatCountdown(accessTokenExpiresAt)}</div>
        <div>Refresh Token: {formatCountdown(refreshTokenExpiresAt)}</div>
      </Box>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.fullName} — {user.email}
          </li>
        ))}
      </ul>
    </>
  );
}
