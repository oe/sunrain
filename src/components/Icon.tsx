import type { LucideIcon } from 'lucide-react';
import { ChevronRight, AlertTriangle, Phone, ExternalLink, SearchX } from 'lucide-react';

interface IconProps {
  name: 'chevron-right' | 'alert-triangle' | 'phone' | 'external-link' | 'search-x';
  class?: string;
  size?: number;
}

const iconMap: Record<string, LucideIcon> = {
  'chevron-right': ChevronRight,
  'alert-triangle': AlertTriangle,
  'phone': Phone,
  'external-link': ExternalLink,
  'search-x': SearchX,
};

export default function Icon({ name, class: className, size = 24 }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  
  return <IconComponent className={className} size={size} strokeWidth={2} />;
}

