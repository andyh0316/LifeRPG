import { TaskTemplateDto } from './dto/task-template.dto';

export const TASK_TEMPLATES: TaskTemplateDto[] = [
  {
    key: 'meditation',
    label: 'Meditation',
    name: 'Meditate',
    desc: 'Daily meditation practice',
    icon: 'SelfImprovement',
    amountUnit: 'minutes',
    blocks: [
      { amount: 10, xpReward: 10, coinReward: 5 },
      { amount: 20, xpReward: 25, coinReward: 12 },
      { amount: 30, xpReward: 40, coinReward: 20 },
    ],
  },
  {
    key: 'reading',
    label: 'Reading',
    name: 'Read',
    desc: 'Read a book',
    icon: 'MenuBook',
    amountUnit: 'minutes',
    blocks: [
      { amount: 15, xpReward: 10, coinReward: 5 },
      { amount: 30, xpReward: 25, coinReward: 12 },
      { amount: 60, xpReward: 50, coinReward: 25 },
    ],
  },
  {
    key: 'exercise',
    label: 'Exercise',
    name: 'Exercise',
    desc: 'Physical workout',
    icon: 'FitnessCenter',
    amountUnit: 'minutes',
    blocks: [
      { amount: 15, xpReward: 15, coinReward: 8 },
      { amount: 30, xpReward: 30, coinReward: 15 },
      { amount: 60, xpReward: 60, coinReward: 30 },
    ],
  },
  {
    key: 'journaling',
    label: 'Journaling',
    name: 'Journal',
    desc: 'Write in your journal',
    icon: 'HistoryEdu',
    amountUnit: null,
    blocks: [{ amount: null, xpReward: 15, coinReward: 8 }],
  },
  {
    key: 'stretching',
    label: 'Stretching',
    name: 'Stretch',
    desc: 'Stretching routine',
    icon: 'Spa',
    amountUnit: 'minutes',
    blocks: [
      { amount: 10, xpReward: 8, coinReward: 4 },
      { amount: 20, xpReward: 18, coinReward: 9 },
    ],
  },
];
