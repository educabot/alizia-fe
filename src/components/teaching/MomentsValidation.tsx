import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { validateMoments } from './MomentEditor';

interface MomentsValidationProps {
  moments: { apertura: number[]; desarrollo: number[]; cierre: number[] };
  maxDesarrolloActivities?: number;
  showSuccess?: boolean;
}

export function MomentsValidation({ moments, maxDesarrolloActivities, showSuccess = false }: MomentsValidationProps) {
  const { valid, errors } = validateMoments(moments, maxDesarrolloActivities);

  if (valid) {
    if (!showSuccess) return null;
    return (
      <div
        role='status'
        className='rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900 flex items-center gap-2'
      >
        <CheckCircle2 className='w-4 h-4' />
        <span>Los momentos cumplen los requisitos.</span>
      </div>
    );
  }

  return (
    <div role='alert' className='rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900'>
      <div className='flex items-center gap-2 mb-2 font-medium'>
        <AlertTriangle className='w-4 h-4' />
        <span>Revisa los momentos de la clase</span>
      </div>
      <ul className='list-disc list-inside space-y-0.5 text-amber-800'>
        {errors.map((error, index) => (
          <li key={`moment-error-${index}`}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
