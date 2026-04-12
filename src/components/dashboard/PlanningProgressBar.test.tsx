import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanningProgressBar } from './PlanningProgressBar';

describe('PlanningProgressBar', () => {
  it('renders course subject name', () => {
    render(
      <PlanningProgressBar
        progress={{ course_subject_id: 1, course_subject_name: 'Biologia - 1ro A', completed: 5, total: 10 }}
      />,
    );

    expect(screen.getByText('Biologia - 1ro A')).toBeInTheDocument();
  });

  it('renders completed/total count', () => {
    render(
      <PlanningProgressBar
        progress={{ course_subject_id: 1, course_subject_name: 'Fisica', completed: 3, total: 8 }}
      />,
    );

    expect(screen.getByText('3/8')).toBeInTheDocument();
  });

  it('renders 0/0 without error', () => {
    render(
      <PlanningProgressBar progress={{ course_subject_id: 1, course_subject_name: 'Vacia', completed: 0, total: 0 }} />,
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
  });
});
