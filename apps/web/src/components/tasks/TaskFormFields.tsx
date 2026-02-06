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
      <TextField
        label="Name"
        {...register('name', { required: 'Name is required' })}
        error={!!errors.name}
        helperText={errors.name?.message}
        slotProps={shrinkLabels ? { inputLabel: { shrink: true } } : undefined}
      />
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
