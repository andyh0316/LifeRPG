import { useEffect } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import { sxCard } from '@/theme/gameTheme';

type UpdateInventoryItemDto = components['schemas']['UpdateInventoryItemDto'];

const SOURCES = ['shop', 'drop', 'achievement', 'gift'] as const;

export default function EditInventoryItem() {
  const { id } = useParams<{ id: string }>();
  const inventoryItemId = Number(id);
  const navigate = useNavigate();

  const { data: inventoryItem, isLoading } = $api.useQuery(
    'get',
    '/inventory-items/{id}',
    { params: { path: { id: inventoryItemId } } },
  );

  const { data: items = [] } = $api.useQuery('get', '/items');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateInventoryItemDto>();

  useEffect(() => {
    if (!inventoryItem) return;
    reset({
      itemId: inventoryItem.itemId,
      source: inventoryItem.source as UpdateInventoryItemDto['source'],
      usedAt: inventoryItem.usedAt ?? null,
    });
  }, [inventoryItem, reset]);

  const updateItem = $api.useMutation('put', '/inventory-items/{id}', {
    onSuccess: () =>
      navigate('/inventory', { state: { flash: 'Inventory item saved!' } }),
  });

  const onSubmit = (data: UpdateInventoryItemDto) => {
    updateItem.mutate({
      params: { path: { id: inventoryItemId } },
      body: data,
    });
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Edit Inventory Item"
        onCancel={() => navigate('/inventory')}
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
        <Controller
          name="itemId"
          control={control}
          rules={{ validate: (v) => v > 0 || 'Select an item' }}
          render={({ field }) => (
            <TextField
              label="Item"
              select
              value={field.value || ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              error={!!errors.itemId}
              helperText={errors.itemId?.message}
              fullWidth
            >
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="source"
          control={control}
          render={({ field }) => (
            <TextField
              label="Source"
              select
              value={field.value || 'shop'}
              onChange={field.onChange}
              sx={{ width: 200 }}
            >
              {SOURCES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="usedAt"
          control={control}
          render={({ field }) => (
            <TextField
              label="Used At"
              type="datetime-local"
              value={
                field.value
                  ? new Date(field.value).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                field.onChange(
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                )
              }
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Leave empty if not yet used"
            />
          )}
        />
      </Box>
    </Box>
  );
}
