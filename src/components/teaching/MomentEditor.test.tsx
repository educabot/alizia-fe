import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MomentEditor, validateMoments } from './MomentEditor';
import type { Activity } from '@/types';

const ACTIVITIES: Activity[] = [
  { id: 1, name: 'Lluvia de ideas', moment: 'apertura' },
  { id: 2, name: 'Pregunta disparadora', moment: 'apertura' },
  { id: 3, name: 'Video introductorio', moment: 'apertura' },
];

describe('MomentEditor', () => {
  it('renders label and add button', () => {
    render(
      <MomentEditor
        momentKey='apertura'
        label='Apertura'
        selectedActivityIds={[]}
        availableActivities={ACTIVITIES}
        onActivitiesChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Apertura')).toBeInTheDocument();
    expect(screen.getByText('Agregar actividad')).toBeInTheDocument();
  });

  it('renders selected activity chips', () => {
    render(
      <MomentEditor
        momentKey='apertura'
        label='Apertura'
        selectedActivityIds={[1, 2]}
        availableActivities={ACTIVITIES}
        onActivitiesChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Lluvia de ideas')).toBeInTheDocument();
    expect(screen.getByText('Pregunta disparadora')).toBeInTheDocument();
  });

  it('removes activity when X is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MomentEditor
        momentKey='apertura'
        label='Apertura'
        selectedActivityIds={[1, 2]}
        availableActivities={ACTIVITIES}
        onActivitiesChange={onChange}
      />,
    );

    // Click the X button on "Lluvia de ideas"
    const removeButtons = screen.getAllByRole('button');
    // First removable button (after the "Agregar" link)
    const xButtons = removeButtons.filter((btn) => btn.querySelector('svg.lucide-x'));
    await user.click(xButtons[0]);

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it('shows count when maxActivities is set', () => {
    render(
      <MomentEditor
        momentKey='apertura'
        label='Apertura'
        selectedActivityIds={[1]}
        availableActivities={ACTIVITIES}
        onActivitiesChange={vi.fn()}
        maxActivities={1}
      />,
    );

    expect(screen.getByText('1/1')).toBeInTheDocument();
  });
});

describe('validateMoments', () => {
  it('returns valid when all constraints met', () => {
    const result = validateMoments({
      apertura: [1],
      desarrollo: [10, 11],
      cierre: [20],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('fails when apertura has 0 activities', () => {
    const result = validateMoments({
      apertura: [],
      desarrollo: [10],
      cierre: [20],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Apertura debe tener exactamente 1 actividad');
  });

  it('fails when apertura has 2 activities', () => {
    const result = validateMoments({
      apertura: [1, 2],
      desarrollo: [10],
      cierre: [20],
    });
    expect(result.valid).toBe(false);
  });

  it('fails when desarrollo exceeds max', () => {
    const result = validateMoments(
      {
        apertura: [1],
        desarrollo: [10, 11, 12, 13],
        cierre: [20],
      },
      3,
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Desarrollo puede tener maximo 3 actividades');
  });

  it('fails when cierre is empty', () => {
    const result = validateMoments({
      apertura: [1],
      desarrollo: [10],
      cierre: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Cierre debe tener exactamente 1 actividad');
  });
});
