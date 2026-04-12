import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { coordinationKeys } from '@/hooks/queries/useCoordinationQueries';
import { Course } from './Course';
import type { Course as CourseType, CourseSubject, Subject, Area, CoordinationDocument } from '@/types';

vi.mock('@/services/api', () => ({
  coordinationDocumentsApi: {
    list: vi.fn().mockResolvedValue({ items: [], more: false }),
  },
}));

const mockCourse: CourseType = {
  id: 1,
  name: '1A',
  school_year: 2026,
  created_at: '2026-01-01',
};

const mockAreas: Area[] = [{ id: 100, name: 'Matematicas', created_at: '2026-01-01' }];

const mockSubjects: Subject[] = [{ id: 200, name: 'Algebra', area_id: 100, created_at: '2026-01-01' }];

const mockCourseSubjects: CourseSubject[] = [
  {
    id: 1,
    course_id: 1,
    course_name: '1A',
    subject_id: 200,
    subject_name: 'Algebra',
    teacher_id: 3,
    teacher_name: 'Maria Docente',
    school_year: 2026,
  },
];

const mockDocuments: CoordinationDocument[] = [
  {
    id: 50,
    organization_id: 1,
    name: 'Itinerario Matematicas',
    area_id: 100,
    area_name: 'Matematicas',
    start_date: '2026-03-01',
    end_date: '2026-07-01',
    status: 'in_progress',
    sections: {},
    topics: [],
    subjects: [],
    org_config: { coord_doc_sections: [] },
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderCourse(courseId = '1') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/coordinator/courses/${courseId}`]}>
        <Routes>
          <Route path='/coordinator/courses/:id' element={<Course />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Course page', () => {
  beforeEach(() => {
    queryClient = createTestQueryClient();
    queryClient.setQueryData(referenceKeys.courses, [mockCourse]);
    queryClient.setQueryData(referenceKeys.courseSubjects, mockCourseSubjects);
    queryClient.setQueryData(referenceKeys.areas, mockAreas);
    queryClient.setQueryData(referenceKeys.subjects, mockSubjects);
    queryClient.setQueryData(coordinationKeys.all, mockDocuments);
  });

  it('shows course name in header', async () => {
    renderCourse();
    expect(screen.getByText(/Curso 1A/i)).toBeInTheDocument();
  });

  it('lists course subjects with teacher names', () => {
    renderCourse();
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Maria Docente')).toBeInTheDocument();
  });

  it('shows course info panel with school year', () => {
    renderCourse();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('filters documents by course areas', () => {
    renderCourse();
    expect(screen.getByText('Itinerario Matematicas')).toBeInTheDocument();
  });

  it('shows not-found state when course does not exist', () => {
    renderCourse('999');
    expect(screen.getByText(/no encontrado/i)).toBeInTheDocument();
  });
});
