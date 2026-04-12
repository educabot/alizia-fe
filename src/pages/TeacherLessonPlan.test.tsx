import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { TeacherLessonPlan } from './TeacherLessonPlan';
import type { LessonPlan } from '@/types';

const getByIdMock = vi.fn();
const updateMock = vi.fn();

vi.mock('@/services/api', () => ({
  lessonPlansApi: {
    getById: (...args: unknown[]) => getByIdMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    generateActivity: vi.fn(),
  },
}));

vi.mock('@/components/ai/ChatPanel', () => ({
  ChatPanel: () => <div data-testid='chat-panel' />,
}));

vi.mock('@/components/ai/LoadingOrb', () => ({
  LoadingOrb: ({ message }: { message?: string }) => <div data-testid='loading-orb'>{message}</div>,
}));

const mockPlan: LessonPlan = {
  id: 500,
  course_subject_id: 1,
  coordination_document_id: 1,
  class_number: 3,
  title: 'Intro a ecuaciones',
  status: 'in_progress',
  is_shared: false,
  resources_mode: 'global',
  moments: {
    apertura: { activities: [], activityContent: {} },
    desarrollo: { activities: [], activityContent: {} },
    cierre: { activities: [], activityContent: {} },
  },
  coord_class: { title: 'Intro a ecuaciones', objective: '', topics: [] },
};

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderPage(planId = '500') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/teacher/plans/${planId}`]}>
        <Routes>
          <Route path='/teacher/plans/:id' element={<TeacherLessonPlan />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TeacherLessonPlan page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(referenceKeys.activitiesByMoment, { apertura: [], desarrollo: [], cierre: [] });
    getByIdMock.mockResolvedValue(mockPlan);
  });

  it('shows loading orb while plan loads', () => {
    getByIdMock.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        }),
    );
    renderPage();
    expect(screen.getByTestId('loading-orb')).toBeInTheDocument();
  });

  it('renders plan title after load', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Intro a ecuaciones').length).toBeGreaterThan(0);
    });
  });

  it('shows publish button when not published', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Publicar$/i })).toBeInTheDocument();
    });
  });

  it('shows "Publicado" label when plan is published', async () => {
    getByIdMock.mockResolvedValueOnce({ ...mockPlan, status: 'published' });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publicado/i })).toBeInTheDocument();
    });
  });
});
