import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import { sxCard } from '@/theme/gameTheme';

type CreateShopListingDto = components['schemas']['CreateShopListingDto'];

const DEFAULTS: CreateShopListingDto = {
  itemId: 0,
  coinCost: 0,
  sortOrder: 0,
};

export default function CreateShopListing() {
  const navigate = useNavigate();
  const { data: items = [] } = $api.useQuery('get', '/items');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateShopListingDto>({
    defaultValues: DEFAULTS,
  });

  const createListing = $api.useMutation('post', '/shop-listings', {
    onSuccess: () =>
      navigate('/shop', { state: { flash: 'Shop listing created!' } }),
  });

  const onSubmit = (data: CreateShopListingDto) => {
    createListing.mutate({ body: data });
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Create Shop Listing"
        onCancel={() => navigate('/shop')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={createListing.isPending}
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

        <Stack direction="row" spacing={2}>
          <TextField
            label="Coin Cost"
            type="number"
            {...register('coinCost', { valueAsNumber: true, min: 0 })}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ width: 160 }}
          />
          <TextField
            label="Sort Order"
            type="number"
            {...register('sortOrder', { valueAsNumber: true })}
            sx={{ width: 140 }}
          />
        </Stack>
      </Box>
    </Box>
  );
}
