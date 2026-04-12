import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { TeacherCourseSubject } from './TeacherCourseSubject';
import type { Course, CourseSubject, Subject, Area, LessonPlan } from '@/types';

const listByCourseSubjectMock = vi.fn();
vi.mock('@/services/api', () => ({
  lessonPlansApi: {
    listByCourseSubject: (...args: unknown[]) => listByCourseSubjectMock(...args),
  },
  courseSubjectsApi: {},
}));

const mockCourses: Course[] = [{ id: 10, name: '1A', school_year: 2026, created_at: '2026-01-01' }];

const mockAreas: Area[] = [{ id: 100, name: 'Matematicas', created_at: '2026-01-01' }];

const mockSubjects: Subject[] = [{ id: 200, name: 'Algebra', area_id: 100, created_at: '2026-01-01' }];

const mockCourseSubjects: CourseSubject[] = [
  {
    id: 1,
    course_id: 10,
    course_name: '1A',
    subject_id: 200,
    subject_name: 'Algebra',
    teacher_id: 3,
    teacher_name: 'Maria',
    school_year: 2026,
  },
];

const mockLessonPlans: LessonPlan[] = [
  {
    id: 500,
    course_subject_id: 1,
    coordination_document_id: 1,
    class_number: 1,
    title: 'Intro a algebra',
    status: 'in_progress',
    is_shared: false,
    resources_mode: 'global',
    coord_class: { title: 'Intro a algebra', objective: '', topics: [] },
  },
  {
    id: null,
    course_subject_id: 1,
    coordination_document_id: 1,
    class_number: 2,
    title: null,
    status: 'pending',
    is_shared: true,
    resources_mode: 'global',
    coord_class: { title: 'Ecuaciones', objective: '', topics: [] },
  },
];

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderPage(csId = '1') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/teacher/courses/${csId}`]}>
        <Routes>
          <Route path='/teacher/courses/:id' element={<TeacherCourseSubject />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TeacherCourseSubject page', () => {
  beforeEach(() => {
    queryClient = createTestQueryClient();
    queryClient.setQueryData(referenceKeys.courses, mockCourses);
    queryClient.setQueryData(referenceKeys.courseSubjects, mockCourseSubjects);
    queryClient.setQueryData(referenceKeys.subjects, mockSubjects);
    queryClient.setQueryData(referenceKeys.areas, mockAreas);
    listByCourseSubjectMock.mockResolvedValue({ items: mockLessonPlans, more: false });
  });

  it('shows course and subject name in header', async () => {
    renderPage();
    expect(screen.getByText(/1A - Algebra/i)).toBeInTheDocument();
  });

  it('lists lesson plans from coord classes', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Intro a algebra')).toBeInTheDocument();
      expect(screen.getByText('Ecuaciones')).toBeInTheDocument();
    });
  });

  it('shows shared badge for shared classes', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Compartida')).toBeInTheDocument();
    });
  });

  it('shows not-found state when course subject does not exist', () => {
    renderPage('999');
    expect(screen.getByText(/no encontrado/i)).toBeInTheDocument();
  });
});
