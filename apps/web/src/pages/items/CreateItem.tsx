import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import TaskIcon from '@/components/icons/TaskIcon';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { GAME_COLORS, GAME_RADII, sxCard } from '@/theme/gameTheme';

type CreateItemDto = components['schemas']['CreateItemDto'];

const DEFAULTS: CreateItemDto = {
  name: '',
  desc: null,
  icon: null,
  amount: 1,
  amountUnit: 'count',
};

interface LocationState {
  selectedIcon?: string | null;
  formData?: CreateItemDto;
}

export default function CreateItem() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateItemDto>({
    defaultValues: state?.formData ?? DEFAULTS,
  });

  useEffect(() => {
    if (state?.selectedIcon !== undefined) {
      setValue('icon', state.selectedIcon);
    }
  }, [state, setValue]);

  const iconValue = watch('icon');

  const createItem = $api.useMutation('post', '/items', {
    onSuccess: () => navigate('/items', { state: { flash: 'Item created!' } }),
  });

  const onSubmit = (data: CreateItemDto) => {
    createItem.mutate({ body: data });
  };

  const handlePickIcon = () => {
    navigate('/items/pick-icon', {
      state: {
        returnTo: '/items/create',
        currentIcon: iconValue,
        formData: getValues(),
      },
    });
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
            onClick={handlePickIcon}
            sx={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1.5px solid ${GAME_COLORS.cardBorder}`,
              borderRadius: GAME_RADII.button,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: GAME_COLORS.accent,
                bgcolor: GAME_COLORS.accentSubtle,
              },
              '& .MuiSvgIcon-root': {
                color: iconValue ? GAME_COLORS.accent : GAME_COLORS.textMuted,
              },
            }}
          >
            {iconValue ? (
              <TaskIcon name={iconValue} />
            ) : (
              <AddPhotoAlternateIcon />
            )}
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
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
              </TextField>
            )}
          />
        </Stack>
      </Box>
    </Box>
  );
}
