import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  onClick: () => Promise<void> | void;
  label?: string;
  isGenerating: boolean;
  error?: string | null;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable "Generar con Alizia" button with loading/error states.
 * Used across coordination docs, lesson plans, and resources.
 */
export function GenerateButton({
  onClick,
  label = 'Generar con Alizia',
  isGenerating,
  error = null,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
}: GenerateButtonProps) {
  return (
    <div className='inline-flex flex-col items-start gap-1'>
      <Button
        onClick={onClick}
        disabled={isGenerating || disabled}
        variant={variant}
        size={size}
        className={cn('gap-2 cursor-pointer', className)}
      >
        {isGenerating ? (
          <>
            <Loader2 className='w-4 h-4 animate-spin' />
            Generando...
          </>
        ) : (
          <>
            <Sparkles className='w-4 h-4' />
            {label}
          </>
        )}
      </Button>
      {error && (
        <div className='flex items-center gap-1 text-xs text-red-600'>
          <AlertCircle className='w-3 h-3' />
          {error}
        </div>
      )}
    </div>
  );
}
