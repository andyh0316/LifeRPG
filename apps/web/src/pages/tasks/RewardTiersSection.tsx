import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@/components/mui/TextField';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TimerIcon from '@mui/icons-material/Timer';
import TagIcon from '@mui/icons-material/Tag';
import { Controller, useWatch, FieldValues } from 'react-hook-form';

interface RewardTiersSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  fields: FieldValues[];
  append: (value: {
    amount: number;
    xpReward: number;
    coinReward: number;
  }) => void;
  remove: (index: number) => void;
  onUnitChange: (value: string) => void;
}

export default function RewardTiersSection({
  control,
  register,
  fields,
  append,
  remove,
  onUnitChange,
}: RewardTiersSectionProps) {
  const amountUnit = useWatch({ control, name: 'amountUnit' });
  const isTimed = amountUnit === 'minutes';

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Reward Tiers
        </Typography>
        <Controller
          name="amountUnit"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Unit"
              size="small"
              sx={{ width: 130 }}
              value={field.value ?? 'count'}
              onChange={(e) => onUnitChange(e.target.value)}
            >
              <MenuItem value="count">Count</MenuItem>
              <MenuItem value="minutes">Minutes</MenuItem>
            </TextField>
          )}
        />
      </Box>

      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}
        >
          <TextField
            label={isTimed ? 'Minutes' : 'Count'}
            type="number"
            size="small"
            sx={{ width: 110 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {isTimed ? (
                      <TimerIcon fontSize="small" />
                    ) : (
                      <TagIcon fontSize="small" />
                    )}
                  </InputAdornment>
                ),
              },
            }}
            {...register(`blocks.${index}.amount`, {
              valueAsNumber: true,
              min: 1,
            })}
          />
          <TextField
            label="XP"
            type="number"
            size="small"
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <StarIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              },
            }}
            {...register(`blocks.${index}.xpReward`, {
              valueAsNumber: true,
              min: 0,
            })}
          />
          <TextField
            label="Coins"
            type="number"
            size="small"
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MonetizationOnIcon
                      fontSize="small"
                      sx={{ color: 'warning.main' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            {...register(`blocks.${index}.coinReward`, {
              valueAsNumber: true,
              min: 0,
            })}
          />
          {fields.length > 1 && (
            <IconButton size="small" onClick={() => remove(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ))}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => append({ amount: 1, xpReward: 0, coinReward: 0 })}
      >
        Add tier
      </Button>
    </Box>
  );
}
