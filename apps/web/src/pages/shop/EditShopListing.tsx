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
import { sxCard } from '@/theme/gameTheme';

type UpdateShopListingDto = components['schemas']['UpdateShopListingDto'];

export default function EditShopListing() {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);
  const navigate = useNavigate();

  const { data: listing, isLoading } = $api.useQuery(
    'get',
    '/shop-listings/{id}',
    { params: { path: { id: listingId } } },
  );

  const { data: items = [] } = $api.useQuery('get', '/items');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateShopListingDto>();

  useEffect(() => {
    if (!listing) return;
    reset({
      itemId: listing.itemId,
      coinCost: listing.coinCost,
      sortOrder: listing.sortOrder,
    });
  }, [listing, reset]);

  const updateListing = $api.useMutation('put', '/shop-listings/{id}', {
    onSuccess: () =>
      navigate('/shop', { state: { flash: 'Shop listing saved!' } }),
  });

  const onSubmit = (data: UpdateShopListingDto) => {
    updateListing.mutate({
      params: { path: { id: listingId } },
      body: data,
    });
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Edit Shop Listing"
        onCancel={() => navigate('/shop')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={updateListing.isPending}
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
