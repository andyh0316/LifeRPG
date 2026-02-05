import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { $api, type components } from '@life-rpg/api-client';

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

  const amountUnit = useWatch({ control, name: 'amountUnit' });
  const isTimed = amountUnit === 'minutes';

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
    const unit = value === '' ? null : (value as 'minutes');
    setValue('amountUnit', unit);
    if (!unit) {
      const firstBlock = {
        id: getValues('blocks.0.id'),
        amount: null,
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
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h4">Edit Task</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={updateTask.isPending}
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
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Description"
          multiline
          rows={3}
          {...register('desc')}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {/* Blocks / Reward Tiers */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Reward Tiers
            </Typography>
            <Controller
              name="amountUnit"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Unit"
                  size="small"
                  sx={{ width: 130 }}
                  value={field.value ?? ''}
                  onChange={(e) => handleUnitChange(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="minutes">Minutes</MenuItem>
                </TextField>
              )}
            />
          </Box>

          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}
            >
              {isTimed && (
                <TextField
                  label="Minutes"
                  type="number"
                  size="small"
                  sx={{ width: 110 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimerIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  {...register(`blocks.${index}.amount`, {
                    valueAsNumber: true,
                    min: 1,
                  })}
                />
              )}
              <TextField
                label="XP"
                type="number"
                size="small"
                sx={{ flex: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <StarIcon
                          fontSize="small"
                          sx={{ color: 'primary.main' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register(`blocks.${index}.xpReward`, {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
              <TextField
                label="Coins"
                type="number"
                size="small"
                sx={{ flex: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOnIcon
                          fontSize="small"
                          sx={{ color: 'warning.main' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                {...register(`blocks.${index}.coinReward`, {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
              {isTimed && fields.length > 1 && (
                <IconButton size="small" onClick={() => remove(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          {isTimed && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                append({ amount: null, xpReward: 0, coinReward: 0 })
              }
            >
              Add tier
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}
