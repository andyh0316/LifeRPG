import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';

type CreateTaskDto = components['schemas']['CreateTaskDto'];

export default function CreateTask() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskDto>({
    defaultValues: {
      name: '',
      desc: null,
      xpReward: 0,
      coinReward: 0,
      icon: null,
      blocks: [{ amount: null, xpReward: 0, coinReward: 0 }],
    },
  });

  const createTask = $api.useMutation('post', '/tasks', {
    onSuccess: () => navigate('/tasks'),
  });

  const onSubmit = (data: CreateTaskDto) => {
    createTask.mutate({ body: data });
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h4">Create Task</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={createTask.isPending}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}
      >
        <TextField
          label="Name"
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="Description"
          multiline
          rows={3}
          {...register('desc')}
        />
      </Box>
    </>
  );
}
