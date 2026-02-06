import Assignment from '@mui/icons-material/Assignment';
import { ICON_MAP } from './iconRegistry';

interface TaskIconProps {
  name: string | null | undefined;
  fontSize?: 'small' | 'medium' | 'large';
}

export default function TaskIcon({ name, fontSize = 'medium' }: TaskIconProps) {
  const IconComponent = name ? ICON_MAP[name] : null;
  if (IconComponent) {
    return <IconComponent fontSize={fontSize} />;
  }
  return <Assignment fontSize={fontSize} />;
}
