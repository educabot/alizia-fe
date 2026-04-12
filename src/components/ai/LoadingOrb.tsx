import { cn } from '@/lib/utils';

interface LoadingOrbProps {
  /** Loading message to display below the orb */
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

/**
 * AI loading indicator orb with pulsing animation.
 * Used during AI generation operations.
 */
export function LoadingOrb({ message = 'Generando con IA...', size = 'md', className }: LoadingOrbProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        <div className='absolute inset-0 bg-linear-to-b from-white via-indigo-200 to-indigo-500 rounded-full blur-md opacity-60 animate-pulse' />
        <div className='absolute inset-0 bg-linear-to-b from-white via-indigo-300 to-indigo-600 rounded-full animate-pulse' />
      </div>
      {message && <p className='text-sm text-gray-500 animate-pulse'>{message}</p>}
    </div>
  );
}
