import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SharedClassIndicator } from '@/components/coordination/SharedClassIndicator';
import type { LessonPlan, LessonPlanStatus } from '@/types';

interface ClassCardProps {
  plan: LessonPlan;
  onClick: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<LessonPlanStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-[#DAD5F680] text-foreground' },
  in_progress: { label: 'En progreso', className: 'bg-amber-100 text-amber-800' },
  published: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
};

export function ClassCard({ plan, onClick, className }: ClassCardProps) {
  const hasPlan = plan.id !== null;
  const status = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.pending;
  const title = plan.coord_class.title || `Clase ${plan.class_number}`;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-[#FFFFFF4D] backdrop-blur-sm rounded-2xl p-4 cursor-pointer transition-colors hover:bg-[#FFFFFF80] focus:outline-none focus:ring-2 focus:ring-primary/30',
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-semibold text-gray-500'>Clase {plan.class_number}</span>
            {plan.is_shared && <SharedClassIndicator />}
          </div>
          <h4 className='headline-1-bold text-[#10182B]'>{title}</h4>
          <Badge className={cn('rounded-lg', status.className)}>{status.label}</Badge>
        </div>
        <div className='flex items-center gap-2 text-primary font-medium'>
          <span>{hasPlan ? 'Ver plan' : 'Planificar'}</span>
          <ChevronRight className='w-5 h-5' />
        </div>
      </div>
    </div>
  );
}
