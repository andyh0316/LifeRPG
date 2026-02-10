import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { $api, type components } from '@life-rpg/api-client';
import TaskFormHeader from './TaskFormHeader';
import TaskFormFields from './TaskFormFields';
import RewardTiersSection from './RewardTiersSection';
import GoalSection from './GoalSection';
import TaskIcon from '@/components/icons/TaskIcon';
import { sxCard, sxOutlinedButton } from '@/theme/gameTheme';

type CreateTaskDto = components['schemas']['CreateTaskDto'];

const BLANK_DEFAULTS: CreateTaskDto = {
  name: '',
  desc: null,
  icon: null,
  amountUnit: 'count',
  goalAmount: null,
  goalPeriod: null,
  blocks: [{ amount: 1, xpReward: 0, coinReward: 0 }],
};

export default function CreateTask() {
  const navigate = useNavigate();

  const { data: templates } = $api.useQuery('get', '/tasks/templates');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateTaskDto>({
    defaultValues: BLANK_DEFAULTS,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'blocks',
  });

  const createTask = $api.useMutation('post', '/tasks', {
    onSuccess: () => navigate('/tasks', { state: { flash: 'Task created!' } }),
  });

  const onSubmit = (data: CreateTaskDto) => {
    createTask.mutate({ body: data });
  };

  const handleUnitChange = (value: string) => {
    const unit = value as 'count' | 'minutes';
    setValue('amountUnit', unit);
    if (unit === 'count') {
      const firstBlock = {
        amount: 1,
        xpReward: getValues('blocks.0.xpReward') ?? 0,
        coinReward: getValues('blocks.0.coinReward') ?? 0,
      };
      setValue('blocks', [firstBlock]);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTemplateSelect = (name: string) => {
    setAnchorEl(null);
    const template = templates?.find((t) => t.name === name);
    if (!template) return;
    reset({
      name: template.name,
      desc: template.desc,
      icon: template.icon,
      amountUnit: template.amountUnit,
      goalAmount: null,
      goalPeriod: null,
      blocks: template.blocks.map((b) => ({
        amount: b.amount,
        xpReward: b.xpReward,
        coinReward: b.coinReward,
      })),
    });
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <TaskFormHeader
        title="Create Task"
        onCancel={() => navigate('/tasks')}
        onSubmit={handleSubmit(onSubmit)}
        isPending={createTask.isPending}
      />

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          ...sxCard,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2.5,
        }}
      >
        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={sxOutlinedButton}
          >
            Use Template
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {templates?.map((t) => (
              <MenuItem
                key={t.name}
                onClick={() => handleTemplateSelect(t.name)}
              >
                <ListItemIcon>
                  <TaskIcon name={t.icon} fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t.name}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <TaskFormFields register={register} control={control} errors={errors} />

        <RewardTiersSection
          control={control}
          register={register}
          fields={fields}
          append={append}
          remove={remove}
          move={move}
          onUnitChange={handleUnitChange}
        />

        <GoalSection register={register} control={control} />
      </Box>
    </Box>
  );
}
