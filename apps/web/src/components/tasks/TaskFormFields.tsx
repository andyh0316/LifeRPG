import TextField from '@mui/material/TextField';
import { FieldErrors } from 'react-hook-form';

interface TaskFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  errors: FieldErrors<{ name?: string }>;
  shrinkLabels?: boolean;
}

export default function TaskFormFields({
  register,
  errors,
  shrinkLabels,
}: TaskFormFieldsProps) {
  return (
    <>
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
