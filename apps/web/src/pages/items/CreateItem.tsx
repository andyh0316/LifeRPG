import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import IconPicker from '@/components/icons/IconPicker';
import { GAME_COLORS, GAME_RADII, sxCard } from '@/theme/gameTheme';

type CreateItemDto = components['schemas']['CreateItemDto'];

const DEFAULTS: CreateItemDto = {
  name: '',
  desc: null,
  icon: null,
  amount: 1,
  amountUnit: 'count',
};

export default function CreateItem() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateItemDto>({
    defaultValues: DEFAULTS,
  });

  const createItem = $api.useMutation('post', '/items', {
    onSuccess: () => navigate('/items', { state: { flash: 'Item created!' } }),
  });

  const onSubmit = (data: CreateItemDto) => {
    createItem.mutate({ body: data });
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Create Item"
        onCancel={() => navigate('/items')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={createItem.isPending}
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
                value={field.value}
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
