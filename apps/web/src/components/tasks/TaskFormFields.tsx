import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import IconPicker from '../icons/IconPicker';

interface TaskFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  errors: FieldErrors<{ name?: string }>;
  shrinkLabels?: boolean;
}

export default function TaskFormFields({
  register,
  control,
  errors,
  shrinkLabels,
}: TaskFormFieldsProps) {
  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
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
          slotProps={
            shrinkLabels ? { inputLabel: { shrink: true } } : undefined
          }
          fullWidth
        />
      </Stack>
      <TextField
        label="Description"
        multiline
        rows={3}
        {...register('desc')}
        slotProps={shrinkLabels ? { inputLabel: { shrink: true } } : undefined}
      />
    </>
  );
}
