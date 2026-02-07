import * as MuiIcons from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

interface TaskIconProps {
  name: string | null | undefined;
  fontSize?: 'small' | 'medium' | 'large';
}

export default function TaskIcon({ name, fontSize = 'medium' }: TaskIconProps) {
  if (!name) return null;
  const IconComponent = (MuiIcons as Record<string, SvgIconComponent>)[name];
  if (!IconComponent) return null;
  return <IconComponent fontSize={fontSize} />;
}
