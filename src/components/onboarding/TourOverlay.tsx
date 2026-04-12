import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TourStep } from '@/types';

interface TourOverlayProps {
  steps: TourStep[];
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
}

export function TourOverlay({ steps, currentStep, onNext, onSkip }: TourOverlayProps) {
  if (steps.length === 0 || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <span className='text-xs text-gray-400 font-medium'>
            Paso {currentStep + 1} de {steps.length}
          </span>
          <button type='button' onClick={onSkip} className='text-gray-400 hover:text-gray-600 cursor-pointer'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <h3 className='text-lg font-semibold text-gray-900 mb-2'>{step.title}</h3>
        <p className='text-sm text-gray-600 leading-relaxed mb-6'>{step.description}</p>

        <div className='flex items-center justify-between'>
          <button onClick={onSkip} className='text-sm text-gray-500 hover:text-gray-700 cursor-pointer'>
            Omitir tour
          </button>
          <Button onClick={onNext} className='gap-2 cursor-pointer'>
            {isLast ? 'Finalizar' : 'Siguiente'}
            <ArrowRight className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
