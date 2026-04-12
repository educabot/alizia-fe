import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ScheduleGrid } from './ScheduleGrid';
import type { TimeSlot } from '@/types';

const slots: TimeSlot[] = [
  {
    id: 1,
    course_id: 1,
    day: 'monday',
    start_time: '09:00',
    end_time: '10:00',
    subjects: [{ course_subject_id: 1, subject_name: 'Matematicas', teacher_name: 'Ana' }],
  },
  {
    id: 2,
    course_id: 1,
    day: 'wednesday',
    start_time: '08:00',
    end_time: '09:00',
    subjects: [{ course_subject_id: 2, subject_name: 'Lengua', teacher_name: 'Luis' }],
  },
  {
    id: 3,
    course_id: 1,
    day: 'friday',
    start_time: '09:00',
    end_time: '10:00',
    subjects: [
      { course_subject_id: 3, subject_name: 'Biologia', teacher_name: 'Marta' },
      { course_subject_id: 4, subject_name: 'Quimica', teacher_name: 'Jorge' },
    ],
  },
];

describe('ScheduleGrid', () => {
  it('shows the empty state when there are no slots', () => {
    render(<ScheduleGrid slots={[]} />);
    expect(screen.getByText('Sin horarios configurados')).toBeInTheDocument();
  });

  it('renders a custom empty message', () => {
    render(<ScheduleGrid slots={[]} emptyMessage='Cargando...' />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders the five weekday headers', () => {
    render(<ScheduleGrid slots={slots} />);
    for (const label of ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('sorts time rows chronologically', () => {
    const { container } = render(<ScheduleGrid slots={slots} />);
    const rowHeaders = container.querySelectorAll('[data-row-header]');
    expect(rowHeaders[0]).toHaveTextContent('08:00 - 09:00');
    expect(rowHeaders[1]).toHaveTextContent('09:00 - 10:00');
  });

  it('renders subject and teacher inside the correct cell', () => {
    render(<ScheduleGrid slots={slots} />);
    expect(screen.getByText('Matematicas - Ana')).toBeInTheDocument();
    expect(screen.getByText('Lengua - Luis')).toBeInTheDocument();
  });

  it('marks a cell with multiple subjects as shared', () => {
    render(<ScheduleGrid slots={slots} />);
    const shared = screen.getByRole('status', { name: /Clase compartida/i });
    // The shared badge lives inside the non-interactive cell div (no onCellClick).
    const cell = shared.closest('[data-testid="schedule-cell"]');
    expect(cell).not.toBeNull();
    if (cell) {
      expect(within(cell as HTMLElement).getByText('Biologia - Marta')).toBeInTheDocument();
      expect(within(cell as HTMLElement).getByText('Quimica - Jorge')).toBeInTheDocument();
    }
  });

  it('does not show the shared badge on single-subject cells', () => {
    render(
      <ScheduleGrid
        slots={[
          {
            id: 99,
            course_id: 1,
            day: 'monday',
            start_time: '10:00',
            end_time: '11:00',
            subjects: [{ course_subject_id: 10, subject_name: 'Historia', teacher_name: 'Sol' }],
          },
        ]}
      />,
    );
    expect(screen.queryByRole('status', { name: /Clase compartida/i })).not.toBeInTheDocument();
  });

  it('falls back to subject name alone when there is no teacher', () => {
    render(
      <ScheduleGrid
        slots={[
          {
            id: 4,
            course_id: 1,
            day: 'tuesday',
            start_time: '11:00',
            end_time: '12:00',
            subjects: [{ course_subject_id: 5, subject_name: 'Educacion Fisica', teacher_name: null }],
          },
        ]}
      />,
    );
    expect(screen.getByText('Educacion Fisica')).toBeInTheDocument();
  });

  it('calls onCellClick with the right context when a filled cell is clicked', () => {
    const onCellClick = vi.fn();
    render(<ScheduleGrid slots={slots} onCellClick={onCellClick} />);
    fireEvent.click(screen.getByText('Matematicas - Ana'));
    expect(onCellClick).toHaveBeenCalledTimes(1);
    const [[ctx]] = onCellClick.mock.calls;
    expect(ctx.day).toBe('monday');
    expect(ctx.timeRange).toBe('09:00 - 10:00');
    expect(ctx.slot.id).toBe(1);
  });

  it('does not make empty cells interactive', () => {
    const onCellClick = vi.fn();
    render(<ScheduleGrid slots={slots} onCellClick={onCellClick} />);
    // Every clickable cell is a <button>; empty cells must be plain divs.
    const buttons = screen.getAllByRole('button');
    // 3 filled slots → 3 buttons.
    expect(buttons.length).toBe(3);
  });

  it('accepts HH:MM:SS time strings', () => {
    render(
      <ScheduleGrid
        slots={[
          {
            id: 5,
            course_id: 1,
            day: 'thursday',
            start_time: '13:30:00',
            end_time: '14:30:00',
            subjects: [{ course_subject_id: 6, subject_name: 'Arte', teacher_name: 'Paz' }],
          },
        ]}
      />,
    );
    expect(screen.getByText('13:30 - 14:30')).toBeInTheDocument();
  });
});
