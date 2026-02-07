import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect } from 'react';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from './TaskFormHeader';
import TaskFormFields from './TaskFormFields';
import RewardTiersSection from './RewardTiersSection';

type UpdateTaskDto = components['schemas']['UpdateTaskDto'];

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const navigate = useNavigate();

  const { data: task, isLoading } = $api.useQuery('get', '/tasks/{id}', {
    params: { path: { id: taskId } },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<UpdateTaskDto>();

  useEffect(() => {
    if (!task) return;
    reset({
      name: task.name,
      desc: task.desc,
      icon: task.icon,
      amountUnit: task.amountUnit,
      blocks: task.blocks.map((b) => ({
        id: b.id,
        amount: b.amount,
        xpReward: b.xpReward,
        coinReward: b.coinReward,
      })),
    });
  }, [task, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blocks',
  });

  const updateTask = $api.useMutation('patch', '/tasks/{id}', {
    onSuccess: () => navigate('/tasks'),
  });

  const onSubmit = (data: UpdateTaskDto) => {
    updateTask.mutate({
      params: { path: { id: taskId } },
      body: data,
    });
  };

  const handleUnitChange = (value: string) => {
    const unit = value as 'count' | 'minutes';
    setValue('amountUnit', unit);
    if (unit === 'count') {
      const firstBlock = {
        id: getValues('blocks.0.id'),
        amount: 1,
        xpReward: getValues('blocks.0.xpReward') ?? 0,
        coinReward: getValues('blocks.0.coinReward') ?? 0,
      };
      setValue('blocks', [firstBlock]);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Edit Task"
        onCancel={() => navigate('/tasks')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={updateTask.isPending}
      />

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TaskFormFields register={register} control={control} errors={errors} />

        <RewardTiersSection
          control={control}
          register={register}
          fields={fields}
          append={append}
          remove={remove}
          onUnitChange={handleUnitChange}
        />
      </Box>
    </Box>
  );
}
