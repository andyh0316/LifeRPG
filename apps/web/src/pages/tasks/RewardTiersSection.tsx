import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@/components/mui/TextField';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import { GAME_COLORS, GAME_RADII } from '@/theme/gameTheme';
import { Controller, useWatch, FieldValues } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableRewardTierRow from './SortableRewardTierRow';

interface RewardTiersSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  fields: FieldValues[];
  append: (value: {
    amount: number;
    xpReward: number;
    coinReward: number;
  }) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  onUnitChange: (value: string) => void;
}

export default function RewardTiersSection({
  control,
  register,
  fields,
  append,
  remove,
  move,
  onUnitChange,
}: RewardTiersSectionProps) {
  const amountUnit = useWatch({ control, name: 'amountUnit' });
  const isTimed = amountUnit === 'minutes';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: GAME_COLORS.textPrimary,
          }}
        >
          Reward Tiers
        </Typography>
        <Controller
          name="amountUnit"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Unit"
              size="small"
              sx={{ width: 130 }}
              value={field.value ?? 'count'}
              onChange={(e) => onUnitChange(e.target.value)}
            >
              <MenuItem value="count">Count</MenuItem>
              <MenuItem value="minutes">Minutes</MenuItem>
            </TextField>
          )}
        />
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <SortableRewardTierRow
              key={field.id}
              id={field.id}
              index={index}
              isTimed={isTimed}
              register={register}
              canDelete={fields.length > 1}
              onRemove={() => remove(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => append({ amount: 1, xpReward: 0, coinReward: 0 })}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: GAME_RADII.button,
          color: GAME_COLORS.accent,
        }}
      >
        Add tier
      </Button>
    </Box>
  );
}
