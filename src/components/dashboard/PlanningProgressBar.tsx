import { Progress } from '@/components/ui/progress';
import type { PlanningProgress } from '@/types';

interface PlanningProgressBarProps {
  progress: PlanningProgress;
}

export function PlanningProgressBar({ progress }: PlanningProgressBarProps) {
  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-gray-700 font-medium truncate'>{progress.course_subject_name}</span>
        <span className='text-xs text-gray-500 shrink-0 ml-2'>
          {progress.completed}/{progress.total}
        </span>
      </div>
      <Progress value={pct} className='h-2' />
    </div>
  );
}
