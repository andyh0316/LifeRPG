import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import TaskIcon from '@/components/icons/TaskIcon';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { GAME_COLORS, GAME_RADII, sxCard } from '@/theme/gameTheme';

type UpdateItemDto = components['schemas']['UpdateItemDto'];

interface LocationState {
  selectedIcon?: string | null;
}

export default function EditItem() {
  const { id } = useParams<{ id: string }>();
  const itemId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const { data: item, isLoading } = $api.useQuery('get', '/items/{id}', {
    params: { path: { id: itemId } },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
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

  useEffect(() => {
    if (state?.selectedIcon !== undefined) {
      setValue('icon', state.selectedIcon);
    }
  }, [state, setValue]);

  const iconValue = watch('icon');

  const updateItem = $api.useMutation('put', '/items/{id}', {
    onSuccess: () => navigate('/items', { state: { flash: 'Item saved!' } }),
  });

  const onSubmit = (data: UpdateItemDto) => {
    updateItem.mutate({
      params: { path: { id: itemId } },
      body: data,
    });
  };

  const handlePickIcon = () => {
    navigate('/items/pick-icon', {
      state: {
        returnTo: `/items/${id}/edit`,
        currentIcon: iconValue,
      },
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
                value={field.value ?? ''}
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
