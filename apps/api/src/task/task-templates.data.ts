import { TaskTemplateDto } from './dto/task-template.dto';

export const TASK_TEMPLATES: TaskTemplateDto[] = [
  {
    name: 'Meditate',
    icon: 'SelfImprovement',
    amountUnit: 'minutes',
    blocks: [
      { amount: 10, xpReward: 20, coinReward: 20 },
      { amount: 20, xpReward: 50, coinReward: 50 },
    ],
  },
  {
    name: 'Walk',
    icon: 'DirectionsWalk',
    amountUnit: 'minutes',
    blocks: [
      { amount: 15, xpReward: 30, coinReward: 30 },
      { amount: 30, xpReward: 60, coinReward: 60 },
      { amount: 60, xpReward: 150, coinReward: 150 },
    ],
  },
  {
    name: 'Work',
    icon: 'Computer',
    amountUnit: 'minutes',
    blocks: [
      { amount: 30, xpReward: 60, coinReward: 60 },
      { amount: 60, xpReward: 150, coinReward: 150 },
      { amount: 90, xpReward: 250, coinReward: 250 },
    ],
  },
  {
    name: 'Study',
    icon: 'MenuBook',
    amountUnit: 'minutes',
    blocks: [
      { amount: 30, xpReward: 60, coinReward: 60 },
      { amount: 60, xpReward: 150, coinReward: 150 },
      { amount: 90, xpReward: 250, coinReward: 250 },
    ],
  },
  {
    name: 'Chores',
    icon: 'CleaningServices',
    amountUnit: 'minutes',
    blocks: [
      { amount: 30, xpReward: 60, coinReward: 60 },
      { amount: 60, xpReward: 150, coinReward: 150 },
      { amount: 90, xpReward: 250, coinReward: 250 },
    ],
  },
];
