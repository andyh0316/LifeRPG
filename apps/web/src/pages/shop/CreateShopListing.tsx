import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from '@/pages/tasks/TaskFormHeader';
import TextField from '@/components/mui/TextField';
import TaskIcon from '@/components/icons/TaskIcon';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
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
  amountUnit: 'count' | 'minutes' | 'hours' | 'days';
  coinCost: number;
  sortOrder: number;
}

interface LocationState {
  selectedIcon?: string | null;
  formData?: FormValues;
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
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { data: items = [] } = $api.useQuery('get', '/items');
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: state?.formData ?? DEFAULTS });

  useEffect(() => {
    if (state?.selectedIcon !== undefined) {
      setValue('icon', state.selectedIcon);
    }
  }, [state, setValue]);

  const iconValue = watch('icon');
  const linkExisting = watch('linkExisting');

  const handlePickIcon = () => {
    navigate('/items/pick-icon', {
      state: {
        returnTo: '/shop/create',
        currentIcon: iconValue,
        formData: getValues(),
      },
    });
  };

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
        <Stack direction="row" spacing={2}>
          <TextField
            label="Coin Cost"
            type="number"
            {...register('coinCost', { valueAsNumber: true, min: 0 })}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ width: 160 }}
          />
        </Stack>

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
                    color: iconValue
                      ? GAME_COLORS.accent
                      : GAME_COLORS.textMuted,
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
                {...register('name', {
                  validate: (v) =>
                    linkExisting || v.trim() !== '' || 'Name is required',
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
            </Stack>

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

            <TextField
              label="Description (optional)"
              multiline
              rows={3}
              {...register('desc')}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
