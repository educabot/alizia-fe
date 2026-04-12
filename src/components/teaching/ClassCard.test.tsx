import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassCard } from './ClassCard';
import type { LessonPlan } from '@/types';

const basePlan: LessonPlan = {
  id: 10,
  course_subject_id: 5,
  coordination_document_id: 1,
  class_number: 3,
  title: null,
  status: 'in_progress',
  is_shared: false,
  resources_mode: 'global',
  coord_class: {
    title: 'Introduccion a las fracciones',
    objective: 'Comprender el concepto de fraccion',
    topics: [],
  },
};

describe('ClassCard', () => {
  it('shows the class number and coord class title', () => {
    render(<ClassCard plan={basePlan} onClick={() => {}} />);
    expect(screen.getByText('Clase 3')).toBeInTheDocument();
    expect(screen.getByText('Introduccion a las fracciones')).toBeInTheDocument();
  });

  it('falls back to "Clase N" when coord class title is empty', () => {
    render(
      <ClassCard plan={{ ...basePlan, coord_class: { ...basePlan.coord_class, title: '' } }} onClick={() => {}} />,
    );
    expect(screen.getAllByText('Clase 3').length).toBeGreaterThan(0);
  });

  it('renders the "En progreso" badge for in_progress status', () => {
    render(<ClassCard plan={basePlan} onClick={() => {}} />);
    expect(screen.getByText('En progreso')).toBeInTheDocument();
  });

  it('renders the "Publicado" badge for published status', () => {
    render(<ClassCard plan={{ ...basePlan, status: 'published' }} onClick={() => {}} />);
    expect(screen.getByText('Publicado')).toBeInTheDocument();
  });

  it('renders the "Pendiente" badge for pending status', () => {
    render(<ClassCard plan={{ ...basePlan, status: 'pending' }} onClick={() => {}} />);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('shows "Ver plan" label when the plan exists', () => {
    render(<ClassCard plan={basePlan} onClick={() => {}} />);
    expect(screen.getByText('Ver plan')).toBeInTheDocument();
  });

  it('shows "Planificar" label when plan.id is null', () => {
    render(<ClassCard plan={{ ...basePlan, id: null }} onClick={() => {}} />);
    expect(screen.getByText('Planificar')).toBeInTheDocument();
  });

  it('renders SharedClassIndicator when plan is shared', () => {
    render(<ClassCard plan={{ ...basePlan, is_shared: true }} onClick={() => {}} />);
    expect(screen.getByLabelText('Clase compartida')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ClassCard plan={basePlan} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter is pressed', () => {
    const onClick = vi.fn();
    render(<ClassCard plan={basePlan} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
