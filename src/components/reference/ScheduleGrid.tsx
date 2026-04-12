import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SharedClassIndicator } from '@/components/coordination/SharedClassIndicator';
import type { DayOfWeek, TimeSlot, TimeSlotSubject } from '@/types';

/**
 * Weekly schedule grid for a course.
 * RFC Epic 3 — Integracion (datos de referencia).
 *
 * Renders TimeSlot[] in a day x time-range matrix. Cells with more than one
 * course_subject in `subjects` are treated as shared classes and get a
 * SharedClassIndicator badge on top of the list of teachers.
 */

const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miercoles',
  thursday: 'Jueves',
  friday: 'Viernes',
};

export interface ScheduleGridCellContext {
  day: DayOfWeek;
  timeRange: string;
  slot: TimeSlot;
}

interface ScheduleGridProps {
  slots: TimeSlot[];
  /**
   * Fires when a filled cell is clicked (or activated via keyboard).
   * Empty cells are not interactive.
   */
  onCellClick?: (ctx: ScheduleGridCellContext) => void;
  emptyMessage?: string;
  className?: string;
}

function formatRange(start: string, end: string): string {
  // Accept "HH:MM" or "HH:MM:SS" — render as "HH:MM - HH:MM".
  const trim = (t: string) => t.slice(0, 5);
  return `${trim(start)} - ${trim(end)}`;
}

function timeRangeSortKey(range: string): number {
  const start = range.split(' - ')[0] ?? '00:00';
  const [h, m] = start.split(':').map((n) => Number.parseInt(n, 10) || 0);
  return h * 60 + m;
}

function subjectLabel(subject: TimeSlotSubject): string {
  if (subject.teacher_name) {
    return `${subject.subject_name} - ${subject.teacher_name}`;
  }
  return subject.subject_name;
}

export function ScheduleGrid({
  slots,
  onCellClick,
  emptyMessage = 'Sin horarios configurados',
  className,
}: ScheduleGridProps) {
  if (slots.length === 0) {
    return (
      <div
        role='status'
        aria-label='Grilla horaria vacia'
        className={cn('text-center py-12 activity-card-bg rounded-2xl', className)}
      >
        <Calendar className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
        <p className='body-2-regular text-muted-foreground'>{emptyMessage}</p>
      </div>
    );
  }

  // Build the set of unique time ranges, sorted chronologically.
  const timeRanges = Array.from(new Set(slots.map((s) => formatRange(s.start_time, s.end_time)))).sort(
    (a, b) => timeRangeSortKey(a) - timeRangeSortKey(b),
  );

  // Index: `${day}|${timeRange}` -> TimeSlot
  const slotByCell = new Map<string, TimeSlot>();
  for (const slot of slots) {
    const key = `${slot.day}|${formatRange(slot.start_time, slot.end_time)}`;
    slotByCell.set(key, slot);
  }

  const isInteractive = typeof onCellClick === 'function';

  return (
    <section
      aria-label='Grilla horaria'
      className={cn('w-full overflow-x-auto rounded-2xl border border-[#E4E8EF] bg-white', className)}
    >
      <div className='grid min-w-[640px]' style={{ gridTemplateColumns: `120px repeat(${DAY_ORDER.length}, 1fr)` }}>
        {/* Header row */}
        <div className='bg-[#F4F5F9] text-xs font-semibold text-gray-500 uppercase px-3 py-2 border-b border-r border-[#E4E8EF]'>
          Hora
        </div>
        {DAY_ORDER.map((day) => (
          <div
            key={`header-${day}`}
            className='bg-[#F4F5F9] text-xs font-semibold text-gray-500 uppercase px-3 py-2 border-b border-[#E4E8EF] text-center'
          >
            {DAY_LABELS[day]}
          </div>
        ))}

        {/* Body rows */}
        {timeRanges.map((range) => (
          <div key={`row-${range}`} className='contents'>
            <div
              data-row-header
              className='text-xs font-medium text-gray-500 px-3 py-3 border-b border-r border-[#E4E8EF] bg-[#FAFBFD]'
            >
              {range}
            </div>
            {DAY_ORDER.map((day) => {
              const key = `${day}|${range}`;
              const slot = slotByCell.get(key);
              const isShared = (slot?.subjects.length ?? 0) > 1;

              if (!slot) {
                return (
                  <div
                    key={key}
                    data-testid='schedule-cell-empty'
                    className='border-b border-l border-[#E4E8EF] bg-white'
                  />
                );
              }

              const content = (
                <>
                  {isShared && <SharedClassIndicator size='sm' className='mb-1.5' />}
                  <ul className='space-y-0.5'>
                    {slot.subjects.map((sub) => (
                      <li key={`${slot.id}-${sub.course_subject_id}`} className='text-xs text-gray-700 leading-tight'>
                        {subjectLabel(sub)}
                      </li>
                    ))}
                  </ul>
                </>
              );

              if (isInteractive) {
                return (
                  <button
                    key={key}
                    type='button'
                    onClick={() => onCellClick?.({ day, timeRange: range, slot })}
                    className='text-left px-2 py-2 border-b border-l border-[#E4E8EF] bg-white hover:bg-[#F4F5F9] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-inset'
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div
                  key={key}
                  data-testid='schedule-cell'
                  className='px-2 py-2 border-b border-l border-[#E4E8EF] bg-white'
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
