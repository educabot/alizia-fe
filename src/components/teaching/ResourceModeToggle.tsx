import { cn } from '@/lib/utils';
import type { ResourcesMode } from '@/types';

interface ResourceModeToggleProps {
  value: ResourcesMode;
  onChange: (next: ResourcesMode) => void;
  disabled?: boolean;
  className?: string;
}

const OPTIONS: { key: ResourcesMode; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'per_moment', label: 'Por momento' },
];

export function ResourceModeToggle({ value, onChange, disabled = false, className }: ResourceModeToggleProps) {
  return (
    <div role='group' aria-label='Modo de fuentes' className={cn('flex gap-2', className)}>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            type='button'
            role='radio'
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(opt.key)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-white' : 'bg-white text-gray-600',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
