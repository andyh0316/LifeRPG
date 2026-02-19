export interface Block {
  id: number;
  sortOrder: number;
  amount: number;
  xpReward: number;
  coinReward: number;
}

export interface TaskItemProps {
  id: number;
  name: string;
  desc?: string | null;
  icon?: string | null;
  amountUnit: string;
  goalAmount?: number | null;
  goalPeriod?: string | null;
  goalCompletedAmount?: number | null;
  currentStreak?: number;
  blocks: Block[];
  userCharacterId: number;
  index?: number;
  referenceTime: string;
}
