import Box from '@mui/material/Box';
import TextField from '@/components/mui/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TimerIcon from '@mui/icons-material/Timer';
import TagIcon from '@mui/icons-material/Tag';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRewardTierRowProps {
  id: string;
  index: number;
  isTimed: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  canDelete: boolean;
  onRemove: () => void;
}

export default function SortableRewardTierRow({
  id,
  index,
  isTimed,
  register,
  canDelete,
  onRemove,
}: SortableRewardTierRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}
      >
        <DragIndicatorIcon fontSize="small" sx={{ color: 'action.active' }} />
      </Box>
      <TextField
        label={isTimed ? 'Minutes' : 'Count'}
        type="number"
        size="small"
        sx={{ width: 110 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {isTimed ? (
                  <TimerIcon fontSize="small" />
                ) : (
                  <TagIcon fontSize="small" />
                )}
              </InputAdornment>
            ),
          },
        }}
        {...register(`blocks.${index}.amount`, {
          valueAsNumber: true,
          min: 1,
        })}
      />
      <TextField
        label="XP"
        type="number"
        size="small"
        sx={{ flex: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <StarIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          },
        }}
        {...register(`blocks.${index}.xpReward`, {
          valueAsNumber: true,
          min: 0,
        })}
      />
      <TextField
        label="Coins"
        type="number"
        size="small"
        sx={{ flex: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MonetizationOnIcon
                  fontSize="small"
                  sx={{ color: 'warning.main' }}
                />
              </InputAdornment>
            ),
          },
        }}
        {...register(`blocks.${index}.coinReward`, {
          valueAsNumber: true,
          min: 0,
        })}
      />
      {canDelete && (
        <IconButton size="small" onClick={onRemove}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
