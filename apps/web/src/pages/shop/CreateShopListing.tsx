import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import IconPicker from '@/components/icons/IconPicker';
import { GAME_COLORS, GAME_RADII, sxCard } from '@/theme/gameTheme';

type CreateItemDto = components['schemas']['CreateItemDto'];
type CreateShopListingDto = components['schemas']['CreateShopListingDto'];

interface FormValues {
  linkExisting: boolean;
  existingItemId: number;
  name: string;
  desc: string | null;
  icon: string | null;
  amount: number;
  amountUnit: 'count' | 'minutes';
  coinCost: number;
  sortOrder: number;
}

const DEFAULTS: FormValues = {
  linkExisting: false,
  existingItemId: 0,
  name: '',
  desc: null,
  icon: null,
  amount: 1,
  amountUnit: 'count',
  coinCost: 0,
  sortOrder: 0,
};

export default function CreateShopListing() {
  const navigate = useNavigate();
  const { data: items = [] } = $api.useQuery('get', '/items');
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULTS });

  const linkExisting = watch('linkExisting');

  const createItem = $api.useMutation('post', '/items');
  const createListing = $api.useMutation('post', '/shop-listings');

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      let itemId: number;

      if (data.linkExisting) {
        itemId = data.existingItemId;
      } else {
        const itemBody: CreateItemDto = {
          name: data.name,
          desc: data.desc,
          icon: data.icon,
          amount: data.amount,
          amountUnit: data.amountUnit,
        };
        const newItem = await createItem.mutateAsync({ body: itemBody });
        itemId = newItem.id;
      }

      const listingBody: CreateShopListingDto = {
        itemId,
        coinCost: data.coinCost,
        sortOrder: data.sortOrder,
      };
      await createListing.mutateAsync({ body: listingBody });
      navigate('/shop', { state: { flash: 'Shop listing created!' } });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Create Shop Listing"
        onCancel={() => navigate('/shop')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={isPending}
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
          name="linkExisting"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  size="small"
                />
              }
              label="Link existing item instead"
              sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }}
            />
          )}
        />

        {linkExisting ? (
          <Controller
            name="existingItemId"
            control={control}
            rules={{ validate: (v) => v > 0 || 'Select an item' }}
            render={({ field }) => (
              <TextField
                label="Item"
                select
                value={field.value || ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                error={!!errors.existingItemId}
                helperText={errors.existingItemId?.message}
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
        ) : (
          <>
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
                {...register('name', {
                  validate: (v) =>
                    linkExisting || v.trim() !== '' || 'Name is required',
                })}
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
          </>
        )}

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
