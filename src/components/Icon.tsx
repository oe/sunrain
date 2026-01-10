/**
 * Icon component using lucide-react
 * Only imports the icons actually used in the app for optimal bundle size
 */
import {
  CloudSun,
  CloudRain,
  ClipboardList,
  Wind,
  Phone,
  AlertCircle,
  AlertTriangle,
  Clock,
  FileText,
  Lock,
  Globe,
  BarChart3,
  Mail,
  Heart,
  ArrowRight,
  Shield,
  Play,
  Pause,
  RotateCcw,
  Check,
  Music,
  BookOpen,
  WifiOff,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

// Map of icon names to components (only icons used in the app)
const iconMap = {
  CloudSun,
  CloudRain,
  ClipboardList,
  Wind,
  Phone,
  AlertCircle,
  AlertTriangle,
  Clock,
  FileText,
  Lock,
  Globe,
  BarChart3,
  Mail,
  Heart,
  ArrowRight,
  Shield,
  Play,
  Pause,
  RotateCcw,
  Check,
  Music,
  BookOpen,
  WifiOff,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

export function Icon({ name, size = 24, strokeWidth = 2, className = '', ...props }: IconProps) {
  const LucideIcon = iconMap[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}

export default Icon;
