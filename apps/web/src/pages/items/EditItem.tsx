import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import IconPicker from '@/components/icons/IconPicker';
import { GAME_COLORS, GAME_RADII, sxCard } from '@/theme/gameTheme';

type UpdateItemDto = components['schemas']['UpdateItemDto'];

export default function EditItem() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);
  const navigate = useNavigate();

  const { data: item, isLoading } = $api.useQuery('get', '/items/{id}', {
    params: { path: { id: itemId } },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateItemDto>();

  useEffect(() => {
    if (!item) return;
    reset({
      name: item.name,
      desc: item.desc,
      icon: item.icon,
      amount: item.amount,
      amountUnit: item.amountUnit,
    });
  }, [item, reset]);

  const updateItem = $api.useMutation('put', '/items/{id}', {
    onSuccess: () => navigate('/items', { state: { flash: 'Item saved!' } }),
  });

  const onSubmit = (data: UpdateItemDto) => {
    updateItem.mutate({
      params: { path: { id: itemId } },
      body: data,
    });
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Edit Item"
        onCancel={() => navigate('/items')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={updateItem.isPending}
      />

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          ...sxCard,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              border: `1px solid ${GAME_COLORS.cardBorder}`,
              borderRadius: GAME_RADII.button,
            }}
          >
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <IconPicker
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v)}
                />
              )}
            />
          </Box>
          <TextField
            label="Name"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />
        </Stack>

        <TextField
          label="Description"
          multiline
          rows={3}
          {...register('desc')}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Amount"
            type="number"
            {...register('amount', { valueAsNumber: true, min: 1 })}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ width: 120 }}
          />
          <Controller
            name="amountUnit"
            control={control}
            render={({ field }) => (
              <TextField
                label="Unit"
                select
                value={field.value ?? ''}
                onChange={field.onChange}
                sx={{ width: 140 }}
              >
                <MenuItem value="count">Count</MenuItem>
                <MenuItem value="minutes">Minutes</MenuItem>
              </TextField>
            )}
          />
        </Stack>
      </Box>
    </Box>
  );
}
