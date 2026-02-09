import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@/components/mui/TextField';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import IconPicker from '@/components/icons/IconPicker';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';

interface TaskFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  errors: FieldErrors<{ name?: string }>;
}

export default function TaskFormFields({
  register,
  control,
  errors,
}: TaskFormFieldsProps) {
  return (
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
          {...register('name', { required: 'Name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
        />
      </Stack>
      <TextField label="Description" multiline rows={3} {...register('desc')} />
    </>
  );
}
