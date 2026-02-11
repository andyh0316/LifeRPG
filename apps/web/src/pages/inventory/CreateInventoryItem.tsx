import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import { sxCard } from '@/theme/gameTheme';

type CreateInventoryItemDto = components['schemas']['CreateInventoryItemDto'];

const SOURCES = ['shop', 'drop', 'achievement', 'gift'] as const;

export default function CreateInventoryItem() {
  const navigate = useNavigate();
  const { data: items = [] } = $api.useQuery('get', '/items');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInventoryItemDto>({
    defaultValues: { itemId: undefined as unknown as number, source: 'shop' },
  });

  const createItem = $api.useMutation('post', '/inventory-items', {
    onSuccess: () =>
      navigate('/inventory', { state: { flash: 'Item added to inventory!' } }),
  });

  const onSubmit = (data: CreateInventoryItemDto) => {
    createItem.mutate({ body: data });
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Add Inventory Item"
        onCancel={() => navigate('/inventory')}
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
      </Box>
    </Box>
  );
}
