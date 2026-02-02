import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { $api } from '@life-rpg/api-client';
import TaskItem from './TaskItem';

/** Displays the full list of available tasks with their rewards. */
export default function Tasks() {
  const { data: tasks = [], isLoading } = $api.useQuery('get', '/tasks');
  const { data: users = [] } = $api.useQuery('get', '/users');
  const userId = users[0]?.id;

  if (isLoading) {
    return <Typography>Loading…</Typography>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Tasks
      </Typography>
      <List>
        {userId &&
          tasks.map((task) => (
            <TaskItem key={task.id} {...task} userId={userId} />
          ))}
      </List>
    </>
  );
}
