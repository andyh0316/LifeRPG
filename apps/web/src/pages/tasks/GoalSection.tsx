import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@/components/mui/TextField';
import { Control, Controller, useWatch } from 'react-hook-form';
import { GAME_COLORS } from '@/theme/gameTheme';

interface GoalSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}

export default function GoalSection({ register, control }: GoalSectionProps) {
  const goalPeriod = useWatch({ control, name: 'goalPeriod' });
  const amountUnit = useWatch({ control, name: 'amountUnit' });

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
      <Controller
        name="goalPeriod"
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Goal Period"
            size="small"
            sx={{ width: 160 }}
            value={field.value ?? ''}
            onChange={(e) => {
              const v = e.target.value || null;
              field.onChange(v);
            }}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="day-long">Day-Long</MenuItem>
            <MenuItem value="week-long">Week-Long</MenuItem>
            <MenuItem value="month-long">Month-Long</MenuItem>
          </TextField>
        )}
      />
      {goalPeriod && (
        <>
          <TextField
            label="Goal Amount"
            type="number"
            size="small"
            sx={{ width: 130 }}
            {...register('goalAmount', { valueAsNumber: true })}
          />
          <Typography
            sx={{ fontSize: '0.875rem', color: GAME_COLORS.textSecondary }}
          >
            {amountUnit}
          </Typography>
        </>
      )}
    </Stack>
  );
}
