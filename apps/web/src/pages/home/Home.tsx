import Typography from '@mui/material/Typography';
import { $api } from '@life-rpg/api-client';

export default function Home() {
  const { data: users = [] } = $api.useQuery('get', '/users');

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
