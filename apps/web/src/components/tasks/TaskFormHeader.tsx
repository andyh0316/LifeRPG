import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface TaskFormHeaderProps {
  title: string;
  onCancel: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export default function TaskFormHeader({
  title,
  onCancel,
  onSubmit,
  isPending,
}: TaskFormHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
      }}
    >
      <Typography variant="h4">{title}</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={isPending}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
