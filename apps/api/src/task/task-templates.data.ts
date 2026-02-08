import { TaskTemplateDto } from './dto/task-template.dto';

// - brainstorming categories:
//     - physical health: gym, walk, cleaning, chores
//     - mental health: travel, meditate, journaling
//     - relationship: spend time with X
//     - work: work
//     - learning: study
export const TASK_TEMPLATES: TaskTemplateDto[] = [
  {
    name: 'Meditate',
    icon: 'SelfImprovement',
    amountUnit: 'minutes',
    blocks: [
      { amount: 10, xpReward: 20, coinReward: 20 },
      { amount: 15, xpReward: 30, coinReward: 30 },
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
    name: 'Study',
    icon: 'MenuBook',
    amountUnit: 'minutes',
    blocks: [
      { amount: 30, xpReward: 30, coinReward: 30 },
      { amount: 60, xpReward: 60, coinReward: 60 },
      { amount: 90, xpReward: 90, coinReward: 90 },
    ],
  },
  {
    name: 'Work',
    icon: 'Computer',
    amountUnit: 'minutes',
    blocks: [
      { amount: 30, xpReward: 30, coinReward: 30 },
      { amount: 60, xpReward: 60, coinReward: 60 },
      { amount: 90, xpReward: 90, coinReward: 90 },
    ],
  },
  {
    name: 'Chores',
    icon: 'CleaningServices',
    amountUnit: 'minutes',
    blocks: [
      { amount: 30, xpReward: 30, coinReward: 30 },
      { amount: 60, xpReward: 60, coinReward: 60 },
      { amount: 90, xpReward: 90, coinReward: 90 },
    ],
  },
];
