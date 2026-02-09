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
  blocks: Block[];
  userId: number;
  index?: number;
}
