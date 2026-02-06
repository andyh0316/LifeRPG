import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '../../components/tasks/TaskFormHeader';
import TaskFormFields from '../../components/tasks/TaskFormFields';
import RewardTiersSection from '../../components/tasks/RewardTiersSection';

type CreateTaskDto = components['schemas']['CreateTaskDto'];

export default function CreateTask() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateTaskDto>({
    defaultValues: {
      name: '',
      desc: null,
      icon: null,
      amountUnit: null,
      blocks: [{ amount: null, xpReward: 0, coinReward: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blocks',
  });

  const createTask = $api.useMutation('post', '/tasks', {
    onSuccess: () => navigate('/tasks'),
  });

  const onSubmit = (data: CreateTaskDto) => {
    createTask.mutate({ body: data });
  };

  const handleUnitChange = (value: string) => {
    const unit = value === '' ? null : (value as 'minutes');
    setValue('amountUnit', unit);
    if (!unit) {
      const firstBlock = {
        amount: null,
        xpReward: getValues('blocks.0.xpReward') ?? 0,
        coinReward: getValues('blocks.0.coinReward') ?? 0,
      };
      setValue('blocks', [firstBlock]);
    }
  };

  return (
    <>
      <TaskFormHeader
        title="Create Task"
        onCancel={() => navigate('/tasks')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={createTask.isPending}
      />

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}
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
    </>
  );
}
