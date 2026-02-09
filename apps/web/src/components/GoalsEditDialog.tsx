import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@/components/mui/TextField';
import { $api } from '@life-rpg/api-client';
import { useToast } from './toast';
import { GAME_COLORS, GAME_RADII, sxAccentButton } from '@/theme/gameTheme';

interface GoalsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface GoalsFormValues {
  dailyXpTarget: string;
  weeklyXpTarget: string;
  monthlyXpTarget: string;
  quarterlyXpTarget: string;
  yearlyXpTarget: string;
}

const FIELDS = [
  { name: 'dailyXpTarget' as const, label: 'Daily', placeholder: '600' },
  { name: 'weeklyXpTarget' as const, label: 'Weekly', placeholder: '4000' },
  { name: 'monthlyXpTarget' as const, label: 'Monthly', placeholder: '15000' },
  {
    name: 'quarterlyXpTarget' as const,
    label: 'Quarterly',
    placeholder: '45000',
  },
  { name: 'yearlyXpTarget' as const, label: 'Yearly', placeholder: '180000' },
];

function toFormValues(
  data: Record<string, number | null> | undefined,
): GoalsFormValues {
  return {
    dailyXpTarget: data?.dailyXpTarget?.toString() ?? '',
    weeklyXpTarget: data?.weeklyXpTarget?.toString() ?? '',
    monthlyXpTarget: data?.monthlyXpTarget?.toString() ?? '',
    quarterlyXpTarget: data?.quarterlyXpTarget?.toString() ?? '',
    yearlyXpTarget: data?.yearlyXpTarget?.toString() ?? '',
  };
}

export default function GoalsEditDialog({ open, onClose }: GoalsDialogProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: goals } = $api.useQuery('get', '/user-character/goals');
  const { register, handleSubmit, reset } = useForm<GoalsFormValues>({
    defaultValues: toFormValues(undefined),
  });

  useEffect(() => {
    if (open) {
      reset(toFormValues(goals ?? undefined));
    }
  }, [open, goals, reset]);

  const updateGoals = $api.useMutation('patch', '/user-character/goals', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/user-character/goals').queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/user-character/goals/progress')
          .queryKey,
      });
      toast.success('Goals saved!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save goals');
    },
  });

  const onSubmit = (values: GoalsFormValues) => {
    const body: Record<string, number | null> = {};
    for (const field of FIELDS) {
      const raw = values[field.name].trim();
      body[field.name] = raw === '' ? null : Number(raw);
    }
    updateGoals.mutate({ body });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: GAME_RADII.dialog },
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            color: GAME_COLORS.textPrimary,
          }}
        >
          XP Goals
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {FIELDS.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                placeholder={field.placeholder}
                type="number"
                {...register(field.name)}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 } }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: GAME_RADII.button,
              color: GAME_COLORS.textSecondary,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateGoals.isPending}
            sx={sxAccentButton}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
