import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PendingPlansCard } from './PendingPlansCard';
import type { LessonPlan } from '@/types';

const makePlan = (overrides: Partial<LessonPlan>): LessonPlan => ({
  id: 1,
  course_subject_id: 1,
  coordination_document_id: 1,
  class_number: 1,
  title: null,
  status: 'pending',
  is_shared: false,
  resources_mode: 'global',
  coord_class: { title: '', objective: '', topics: [] },
  ...overrides,
});

describe('PendingPlansCard', () => {
  it('counts and lists pending plans (id null or not published)', () => {
    const plans: LessonPlan[] = [
      makePlan({ id: null, class_number: 1, coord_class: { title: 'Intro', objective: '', topics: [] } }),
      makePlan({
        id: 2,
        class_number: 2,
        status: 'in_progress',
        coord_class: { title: 'Fracciones', objective: '', topics: [] },
      }),
      makePlan({ id: 3, class_number: 3, status: 'published' }),
    ];
    render(<PendingPlansCard plans={plans} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Intro')).toBeInTheDocument();
    expect(screen.getByText('Fracciones')).toBeInTheDocument();
  });

  it('shows the empty state when nothing is pending', () => {
    const plans: LessonPlan[] = [makePlan({ status: 'published' })];
    render(<PendingPlansCard plans={plans} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/al dia/)).toBeInTheDocument();
  });

  it('uses "Clase N" fallback when coord_class.title is empty', () => {
    const plans: LessonPlan[] = [makePlan({ id: null, class_number: 4 })];
    render(<PendingPlansCard plans={plans} />);
    expect(screen.getAllByText('Clase 4').length).toBeGreaterThan(0);
  });

  it('limits preview with maxItems and shows the remaining count', () => {
    const plans: LessonPlan[] = [
      makePlan({ id: null, class_number: 1, coord_class: { title: 'A', objective: '', topics: [] } }),
      makePlan({ id: null, class_number: 2, coord_class: { title: 'B', objective: '', topics: [] } }),
      makePlan({ id: null, class_number: 3, coord_class: { title: 'C', objective: '', topics: [] } }),
      makePlan({ id: null, class_number: 4, coord_class: { title: 'D', objective: '', topics: [] } }),
    ];
    render(<PendingPlansCard plans={plans} maxItems={2} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
    expect(screen.getByText('+2 mas')).toBeInTheDocument();
  });

  it('calls onViewPlan when a row is clicked', () => {
    const onViewPlan = vi.fn();
    const plans: LessonPlan[] = [
      makePlan({ id: null, class_number: 1, coord_class: { title: 'Intro', objective: '', topics: [] } }),
    ];
    render(<PendingPlansCard plans={plans} onViewPlan={onViewPlan} />);
    fireEvent.click(screen.getByText('Intro').closest('button') as HTMLButtonElement);
    expect(onViewPlan).toHaveBeenCalledWith(plans[0]);
  });

  it('renders non-interactive rows when onViewPlan is omitted', () => {
    const plans: LessonPlan[] = [makePlan({ id: null, coord_class: { title: 'Intro', objective: '', topics: [] } })];
    render(<PendingPlansCard plans={plans} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
