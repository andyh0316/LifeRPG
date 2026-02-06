import MuiTextField, { type TextFieldProps } from '@mui/material/TextField';

export default function TextField(props: TextFieldProps) {
  const { slotProps, ...rest } = props;
  return (
    <MuiTextField
      {...rest}
      slotProps={{
        ...slotProps,
        inputLabel: { shrink: true, ...slotProps?.inputLabel },
      }}
    />
  );
}
