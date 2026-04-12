import { cn } from '@/lib/utils';
import type { Course } from '@/types';

interface CourseOverviewProps {
  course: Course;
  subjectCount?: number;
  onClick: () => void;
  className?: string;
}

export function CourseOverview({ course, subjectCount, onClick, className }: CourseOverviewProps) {
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
        'bg-white border border-[#E4E8EF] rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30',
        className,
      )}
    >
      <h4 className='text-sm font-medium text-gray-900'>{course.name}</h4>
      <p className='text-xs text-gray-500 mt-0.5'>Ciclo {course.school_year}</p>
      {typeof subjectCount === 'number' && (
        <p className='text-xs text-gray-400 mt-1'>
          {subjectCount} {subjectCount === 1 ? 'materia' : 'materias'}
        </p>
      )}
    </div>
  );
}
