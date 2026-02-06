import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { $api } from '@life-rpg/api-client';
import { formatCountdown } from '../../utils/formatCountdown';

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
          DEBUG: Session Expiry
        </Typography>
        <div>Session Token: {formatCountdown(tokenExpiresAt)}</div>
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
