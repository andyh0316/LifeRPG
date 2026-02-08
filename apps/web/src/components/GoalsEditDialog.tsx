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
  { name: 'dailyXpTarget' as const, label: 'Daily' },
  { name: 'weeklyXpTarget' as const, label: 'Weekly' },
  { name: 'monthlyXpTarget' as const, label: 'Monthly' },
  { name: 'quarterlyXpTarget' as const, label: 'Quarterly' },
  { name: 'yearlyXpTarget' as const, label: 'Yearly' },
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>XP Goals</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {FIELDS.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type="number"
                {...register(field.name)}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 } }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateGoals.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
