import { ClipboardList, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from '@/types';

interface PendingPlansCardProps {
  plans: LessonPlan[];
  onViewPlan?: (plan: LessonPlan) => void;
  maxItems?: number;
  className?: string;
}

function isPending(plan: LessonPlan): boolean {
  return plan.id === null || plan.status !== 'published';
}

export function PendingPlansCard({ plans, onViewPlan, maxItems = 3, className }: PendingPlansCardProps) {
  const pending = plans.filter(isPending);
  const visible = pending.slice(0, maxItems);
  const remaining = Math.max(pending.length - visible.length, 0);

  return (
    <section
      aria-label='Planes pendientes'
      className={cn('bg-white border border-[#E4E8EF] rounded-2xl p-4', className)}
    >
      <div className='flex items-center gap-3 mb-3'>
        <div className='p-2 rounded-lg bg-primary/10 text-primary shrink-0'>
          <ClipboardList className='w-5 h-5' />
        </div>
        <div>
          <p className='text-2xl font-bold text-gray-900'>{pending.length}</p>
          <p className='text-sm text-gray-500'>Planes pendientes</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <p className='text-xs text-gray-400 italic'>Todos tus planes estan al dia.</p>
      ) : (
        <>
          <ul className='space-y-1.5'>
            {visible.map((plan) => {
              const title = plan.coord_class.title || `Clase ${plan.class_number}`;
              const isInteractive = typeof onViewPlan === 'function';
              const row = (
                <>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{title}</p>
                    <p className='text-xs text-gray-400'>Clase {plan.class_number}</p>
                  </div>
                  {isInteractive && <ChevronRight className='w-4 h-4 text-gray-400 shrink-0' />}
                </>
              );

              return (
                <li key={`${plan.course_subject_id}-${plan.class_number}`}>
                  {isInteractive ? (
                    <button
                      type='button'
                      onClick={() => onViewPlan?.(plan)}
                      className='w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left'
                    >
                      {row}
                    </button>
                  ) : (
                    <div className='flex items-center gap-2 p-2'>{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
          {remaining > 0 && <p className='text-xs text-gray-400 mt-2'>+{remaining} mas</p>}
        </>
      )}
    </section>
  );
}
