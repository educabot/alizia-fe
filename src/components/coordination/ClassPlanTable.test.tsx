import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClassPlanTable } from './ClassPlanTable';
import type { DocumentSubject } from '@/types';

const SUBJECTS: DocumentSubject[] = [
  {
    id: 1,
    coord_doc_subject_id: 1,
    subject_id: 1,
    subject_name: 'Biologia',
    class_count: 2,
    topics: [],
    classes: [
      {
        id: 1,
        class_number: 1,
        title: 'Ecosistemas',
        objective: 'Comprender ecosistemas',
        topics: [],
        is_shared: false,
      },
      {
        id: 2,
        class_number: 2,
        title: 'Cadenas troficas',
        objective: 'Analizar cadenas',
        topics: [{ id: 100, name: 'Ecosistemas', level: 3, parent_id: 10, children: [] }],
        is_shared: true,
      },
    ],
  },
  {
    id: 2,
    coord_doc_subject_id: 2,
    subject_id: 2,
    subject_name: 'Fisica',
    class_count: 1,
    topics: [],
    classes: [],
  },
];

describe('ClassPlanTable', () => {
  it('renders subject names', () => {
    render(<ClassPlanTable subjects={SUBJECTS} />);
    expect(screen.getByText('Biologia')).toBeInTheDocument();
    expect(screen.getByText('Fisica')).toBeInTheDocument();
  });

  it('renders class titles and objectives', () => {
    render(<ClassPlanTable subjects={SUBJECTS} />);
    // "Ecosistemas" appears as class title AND topic badge
    expect(screen.getAllByText('Ecosistemas').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Comprender ecosistemas')).toBeInTheDocument();
    expect(screen.getByText('Cadenas troficas')).toBeInTheDocument();
  });

  it('shows shared class indicator', () => {
    render(<ClassPlanTable subjects={SUBJECTS} />);
    expect(screen.getByText('Compartida')).toBeInTheDocument();
  });

  it('shows topic badges on classes', () => {
    render(<ClassPlanTable subjects={SUBJECTS} />);
    // The topic "Ecosistemas" appears as a badge on class 2
    const ecosistemaElements = screen.getAllByText('Ecosistemas');
    expect(ecosistemaElements.length).toBeGreaterThanOrEqual(2); // class title + badge
  });

  it('shows empty state for subjects without classes', () => {
    render(<ClassPlanTable subjects={SUBJECTS} />);
    expect(screen.getByText('Sin clases planificadas')).toBeInTheDocument();
  });

  it('shows empty state when no subjects', () => {
    render(<ClassPlanTable subjects={[]} />);
    expect(screen.getByText('No hay disciplinas asignadas')).toBeInTheDocument();
  });

  it('shows class count per subject', () => {
    render(<ClassPlanTable subjects={SUBJECTS} />);
    expect(screen.getByText('(2 clases)')).toBeInTheDocument();
    expect(screen.getByText('(0 clases)')).toBeInTheDocument();
  });
});
