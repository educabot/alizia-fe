import { Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UpcomingClassItem {
  id: string | number;
  subjectName: string;
  courseName?: string;
  date: string;
  classNumber?: number;
}

interface UpcomingClassesWidgetProps {
  items: UpcomingClassItem[];
  onItemClick?: (item: UpcomingClassItem) => void;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
}

export function UpcomingClassesWidget({
  items,
  onItemClick,
  emptyMessage = 'No tenes clases proximas',
  maxItems = 5,
  className,
}: UpcomingClassesWidgetProps) {
  const visible = items.slice(0, maxItems);

  return (
    <section aria-label='Proximas clases' className={cn('activity-card-bg rounded-2xl p-4', className)}>
      <div className='flex items-center gap-2 mb-3'>
        <Calendar className='w-4 h-4 text-primary' />
        <h3 className='headline-1-bold text-[#10182B]'>Proximas clases</h3>
      </div>

      {visible.length === 0 ? (
        <p className='text-sm text-gray-400 italic py-2'>{emptyMessage}</p>
      ) : (
        <ul className='space-y-2'>
          {visible.map((item) => {
            const isInteractive = typeof onItemClick === 'function';
            const content = (
              <>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {item.subjectName}
                    {typeof item.classNumber === 'number' && (
                      <span className='text-xs text-gray-400 ml-2'>Clase {item.classNumber}</span>
                    )}
                  </p>
                  {item.courseName && <p className='text-xs text-gray-500 truncate'>{item.courseName}</p>}
                  <p className='text-xs text-gray-400'>{item.date}</p>
                </div>
                {isInteractive && <ChevronRight className='w-4 h-4 text-gray-400 shrink-0' />}
              </>
            );

            return (
              <li key={item.id}>
                {isInteractive ? (
                  <button
                    type='button'
                    onClick={() => onItemClick?.(item)}
                    className='w-full flex items-center gap-2 p-2 rounded-lg bg-white/50 hover:bg-white transition-colors cursor-pointer text-left'
                  >
                    {content}
                  </button>
                ) : (
                  <div className='flex items-center gap-2 p-2 rounded-lg bg-white/50'>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
