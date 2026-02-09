import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  sxPageTitle,
  sxAccentButton,
  sxOutlinedButton,
} from '@/theme/gameTheme';

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
      <Typography sx={sxPageTitle}>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" onClick={onCancel} sx={sxOutlinedButton}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isPending}
          sx={sxAccentButton}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
