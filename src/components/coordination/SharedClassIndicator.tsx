import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type SharedClassIndicatorSize = 'sm' | 'md';

interface SharedClassIndicatorProps {
  /** Visual size. Default 'sm'. */
  size?: SharedClassIndicatorSize;
  /** Optional override label. Default "Compartida". */
  label?: string;
  /** Extra classes on the outer badge. */
  className?: string;
}

/**
 * Badge that marks a class (document class or lesson plan class) as shared
 * between multiple teachers at the same time.
 * RFC Epic 3 / 4 — Clases compartidas.
 */
export function SharedClassIndicator({ size = 'sm', label = 'Compartida', className }: SharedClassIndicatorProps) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5';

  const iconClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      role='status'
      aria-label='Clase compartida'
      className={cn(
        'inline-flex items-center rounded-full text-teal-600 bg-teal-50 font-medium',
        sizeClasses,
        className,
      )}
    >
      <Users className={iconClasses} aria-hidden='true' />
      {label}
    </span>
  );
}
