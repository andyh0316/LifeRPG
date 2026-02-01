import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { api } from '@life-rpg/api-client';
import type { components } from '@life-rpg/api-client';

type User = components['schemas']['UserResponseDto'];

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.GET('/users').then(({ data }) => {
      if (data) setUsers(data);
    });
  }, []);

  return (
    <>
      <Typography variant="h4">Home</Typography>
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
