import { useState, useEffect } from 'react';
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

type UpdateShopListingDto = components['schemas']['UpdateShopListingDto'];
type UpdateItemDto = components['schemas']['UpdateItemDto'];

interface FormValues {
  itemId: number;
  coinCost: number;
  sortOrder: number;
  itemName: string;
  itemDesc: string | null;
  itemIcon: string | null;
  itemAmount: number;
  itemAmountUnit: 'count' | 'minutes' | 'hours' | 'days';
}

interface LocationState {
  selectedIcon?: string | null;
}

export default function EditShopListing() {
  const { id } = useParams<{ id: string }>();
  const listingId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [isPending, setIsPending] = useState(false);

  const { data: listing, isLoading: listingLoading } = $api.useQuery(
    'get',
    '/shop-listings/{id}',
    { params: { path: { id: listingId } } },
  );

  const { data: linkedItem, isLoading: itemLoading } = $api.useQuery(
    'get',
    '/items/{id}',
    { params: { path: { id: listing?.itemId ?? 0 } } },
    { enabled: !!listing },
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (!listing || !linkedItem) return;
    reset({
      itemId: listing.itemId,
      coinCost: listing.coinCost,
      sortOrder: listing.sortOrder,
      itemName: linkedItem.name,
      itemDesc: linkedItem.desc,
      itemIcon: linkedItem.icon,
      itemAmount: linkedItem.amount,
      itemAmountUnit: linkedItem.amountUnit,
    });
  }, [listing, linkedItem, reset]);

  useEffect(() => {
    if (state?.selectedIcon !== undefined) {
      setValue('itemIcon', state.selectedIcon);
    }
  }, [state, setValue]);

  const iconValue = watch('itemIcon');

  const handlePickIcon = () => {
    navigate('/items/pick-icon', {
      state: {
        returnTo: `/shop/${id}/edit`,
        currentIcon: iconValue,
      },
    });
  };

  const updateListing = $api.useMutation('put', '/shop-listings/{id}');
  const updateItem = $api.useMutation('put', '/items/{id}');

  const onSubmit = async (data: FormValues) => {
    if (!listing) return;
    setIsPending(true);
    try {
      const itemBody: UpdateItemDto = {
        name: data.itemName,
        desc: data.itemDesc,
        icon: data.itemIcon,
        amount: data.itemAmount,
        amountUnit: data.itemAmountUnit,
      };
      await updateItem.mutateAsync({
        params: { path: { id: data.itemId } },
        body: itemBody,
      });

      const listingBody: UpdateShopListingDto = {
        itemId: data.itemId,
        coinCost: data.coinCost,
        sortOrder: data.sortOrder,
      };
      await updateListing.mutateAsync({
        params: { path: { id: listingId } },
        body: listingBody,
      });

      navigate('/shop', { state: { flash: 'Shop listing saved!' } });
    } finally {
      setIsPending(false);
    }
  };

  if (listingLoading || itemLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Edit Shop Listing"
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
        <Typography
          sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#888', mt: -0.5 }}
        >
          Item
        </Typography>

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
            {...register('itemName', { required: 'Name is required' })}
            error={!!errors.itemName}
            helperText={errors.itemName?.message}
            fullWidth
          />
        </Stack>

        <TextField
          label="Description"
          multiline
          rows={3}
          {...register('itemDesc')}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            label="Amount"
            type="number"
            {...register('itemAmount', { valueAsNumber: true, min: 1 })}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ width: 120 }}
          />
          <Controller
            name="itemAmountUnit"
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

        <Typography
          sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#888', mt: 1 }}
        >
          Listing
        </Typography>

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
