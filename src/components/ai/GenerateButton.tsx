import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RATE_LIMIT_COOLDOWN_SECONDS = 30;

interface GenerateButtonProps {
  onClick: () => Promise<void> | void;
  label?: string;
  isGenerating: boolean;
  error?: string | null;
  /** Error code from the API (e.g. 'AI_RATE_LIMITED'). Triggers cooldown when rate-limited. */
  errorCode?: string | null;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable "Generar con Alizia" button with loading/error states.
 * When the API returns AI_RATE_LIMITED, shows a countdown timer
 * and disables the button until the cooldown expires.
 */
export function GenerateButton({
  onClick,
  label = 'Generar con Alizia',
  isGenerating,
  error = null,
  errorCode = null,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
}: GenerateButtonProps) {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldownSeconds(RATE_LIMIT_COOLDOWN_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (errorCode === 'AI_RATE_LIMITED') {
      startCooldown();
    }
  }, [errorCode, startCooldown]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const isCoolingDown = cooldownSeconds > 0;

  return (
    <div className='inline-flex flex-col items-start gap-1'>
      <Button
        onClick={onClick}
        disabled={isGenerating || isCoolingDown || disabled}
        variant={variant}
        size={size}
        className={cn('gap-2 cursor-pointer', className)}
      >
        {isGenerating ? (
          <>
            <Loader2 className='w-4 h-4 animate-spin' />
            Generando...
          </>
        ) : isCoolingDown ? (
          <>
            <Clock className='w-4 h-4' />
            Espera {cooldownSeconds}s
          </>
        ) : (
          <>
            <Sparkles className='w-4 h-4' />
            {label}
          </>
        )}
      </Button>
      {error && !isCoolingDown && (
        <div className='flex items-center gap-1 text-xs text-red-600'>
          <AlertCircle className='w-3 h-3' />
          {error}
        </div>
      )}
      {isCoolingDown && (
        <div className='flex items-center gap-1 text-xs text-amber-600'>
          <Clock className='w-3 h-3' />
          Demasiado trafico. Reintenta en {cooldownSeconds}s.
        </div>
      )}
    </div>
  );
}
