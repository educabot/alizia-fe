import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { resourceKeys } from '@/hooks/queries/useResourceQueries';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { Resources } from './Resources';
import type { Resource, CourseSubject } from '@/types';

vi.mock('@/services/api', () => ({
  resourcesApi: {
    list: vi.fn().mockResolvedValue({ items: [], more: false }),
    delete: vi.fn(),
  },
  resourceTypesApi: {
    list: vi.fn().mockResolvedValue({ items: [], more: false }),
  },
}));

const mockResources: Resource[] = [
  {
    id: 1,
    resource_type_id: 1,
    resource_type_name: 'Guia de estudio',
    title: 'Guia Algebra',
    content: { body: 'texto' },
    user_id: 3,
    course_subject_id: 10,
    status: 'active',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 2,
    resource_type_id: 1,
    resource_type_name: 'Guia de estudio',
    title: 'Guia Fisica',
    content: {},
    user_id: 3,
    course_subject_id: 11,
    status: 'draft',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
];

const mockCourseSubjects: CourseSubject[] = [
  {
    id: 10,
    course_id: 1,
    course_name: '1A',
    subject_id: 1,
    subject_name: 'Matematicas',
    teacher_id: 3,
    teacher_name: 'Maria',
    school_year: 2026,
  },
  {
    id: 11,
    course_id: 2,
    course_name: '1B',
    subject_id: 2,
    subject_name: 'Fisica',
    teacher_id: 3,
    teacher_name: 'Maria',
    school_year: 2026,
  },
];

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderResources() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Resources />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Resources page', () => {
  beforeEach(() => {
    queryClient = createTestQueryClient();
    queryClient.setQueryData(resourceKeys.all, mockResources);
    queryClient.setQueryData(referenceKeys.courseSubjects, mockCourseSubjects);
    queryClient.setQueryData(referenceKeys.subjects, []);
  });

  it('shows the page title', async () => {
    renderResources();
    expect(screen.getByRole('heading', { name: 'Recursos' })).toBeInTheDocument();
  });

  it('shows empty state when there are no resources', async () => {
    queryClient.setQueryData(resourceKeys.all, []);
    renderResources();
    expect(screen.getByText('Sin recursos creados')).toBeInTheDocument();
  });

  it('renders the create resource button', async () => {
    renderResources();
    expect(screen.getByRole('button', { name: /crear recurso/i })).toBeInTheDocument();
  });

  it('lists the resources', async () => {
    renderResources();
    expect(screen.getByText('Guia Algebra')).toBeInTheDocument();
    expect(screen.getByText('Guia Fisica')).toBeInTheDocument();
  });
});
