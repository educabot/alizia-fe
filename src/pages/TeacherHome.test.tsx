import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { useAuthStore } from '@/store/authStore';
import { TeacherHome } from './TeacherHome';
import type { CourseSubject } from '@/types';

// Mock notifications data since it's not critical to what we're testing
vi.mock('@/mocks/mock-config', () => ({
  MOCK_NOTIFICATIONS: [],
}));

const mockCourseSubjects: CourseSubject[] = [
  {
    id: 1,
    course_id: 10,
    course_name: '1A',
    subject_id: 20,
    subject_name: 'Matematicas',
    teacher_id: 3,
    teacher_name: 'Maria Docente',
    school_year: 2026,
  },
  {
    id: 2,
    course_id: 11,
    course_name: '2B',
    subject_id: 21,
    subject_name: 'Fisica',
    teacher_id: 3,
    teacher_name: 'Maria Docente',
    school_year: 2026,
  },
  {
    id: 3,
    course_id: 12,
    course_name: '3C',
    subject_id: 22,
    subject_name: 'Otra materia',
    teacher_id: 99, // different teacher
    teacher_name: 'Otro',
    school_year: 2026,
  },
];

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderHome() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TeacherHome />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TeacherHome', () => {
  beforeEach(() => {
    queryClient = createTestQueryClient();
    useAuthStore.setState({
      user: { id: 3, name: 'Maria Docente', email: 'm@t.com', avatar: '', roles: ['teacher'] },
    });
    queryClient.setQueryData(referenceKeys.courseSubjects, mockCourseSubjects);
  });

  it('greets the user by first name', () => {
    renderHome();
    expect(screen.getByText(/Hola Maria/i)).toBeInTheDocument();
  });

  it('lists only the teacher own course subjects', () => {
    renderHome();
    expect(screen.getByText('Matematicas')).toBeInTheDocument();
    expect(screen.getByText('Fisica')).toBeInTheDocument();
    expect(screen.queryByText('Otra materia')).not.toBeInTheDocument();
  });
});
