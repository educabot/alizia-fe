import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { useConfigStore } from '@/store/configStore';
import type { Activity, Font, LessonPlan, MomentKey, OrgConfig } from '@/types';

// --- Mocks --------------------------------------------------------------------

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const createPlanMock = vi.fn();
vi.mock('@/services/api', () => ({
  lessonPlansApi: {
    create: (...args: unknown[]) => createPlanMock(...args),
  },
}));

// Mock MomentEditor + keep validateMoments real — the wizard depends on its
// exact gating logic. Using `vi.importActual` lets us partially mock the module.
vi.mock('@/components/teaching/MomentEditor', async () => {
  const actual = await vi.importActual<typeof import('@/components/teaching/MomentEditor')>(
    '@/components/teaching/MomentEditor',
  );
  return {
    ...actual,
    MomentEditor: ({
      momentKey,
      label,
      selectedActivityIds,
      onActivitiesChange,
    }: {
      momentKey: MomentKey;
      label: string;
      selectedActivityIds: number[];
      onActivitiesChange: (ids: number[]) => void;
    }) => (
      <div data-testid={`moment-${momentKey}`}>
        <p>{label}</p>
        <p>selected: {selectedActivityIds.join(',')}</p>
        <button type='button' onClick={() => onActivitiesChange([...selectedActivityIds, 1])}>
          add-to-{momentKey}
        </button>
      </div>
    ),
  };
});

vi.mock('@/components/teaching/MomentsValidation', () => ({
  MomentsValidation: () => <div data-testid='moments-validation' />,
}));

vi.mock('@/components/teaching/ResourceModeToggle', () => ({
  ResourceModeToggle: ({
    value,
    onChange,
  }: {
    value: 'global' | 'per_moment';
    onChange: (v: 'global' | 'per_moment') => void;
  }) => (
    <div>
      <button type='button' onClick={() => onChange('global')}>
        mode-global
      </button>
      <button type='button' onClick={() => onChange('per_moment')}>
        mode-per-moment
      </button>
      <span>current:{value}</span>
    </div>
  ),
}));

import { TeacherPlanWizard } from './TeacherPlanWizard';

// --- Fixtures -----------------------------------------------------------------

function makeActivity(id: number, moment: MomentKey): Activity {
  return {
    id,
    name: `Actividad ${id}`,
    description: '',
    moments: [moment],
    created_at: '2026-01-01',
  } as Activity;
}

const font: Font = {
  id: 42,
  name: 'Fuente demo',
  area_id: 1,
  created_at: '2026-01-01',
};

const BASE_CONFIG: OrgConfig = {
  topic_max_levels: 3,
  topic_level_names: [],
  topic_selection_level: 3,
  shared_classes_enabled: true,
  desarrollo_max_activities: 3,
  coord_doc_sections: [],
  modules: {},
};

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderWizard(path = '/teacher/cs/7/classes/3/new') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path='/teacher/cs/:csId/classes/:classNumber/new' element={<TeacherPlanWizard />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// --- Tests --------------------------------------------------------------------

describe('TeacherPlanWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(referenceKeys.activitiesByMoment, {
      apertura: [makeActivity(1, 'apertura')],
      desarrollo: [makeActivity(1, 'desarrollo'), makeActivity(2, 'desarrollo')],
      cierre: [makeActivity(1, 'cierre')],
    });
    queryClient.setQueryData(referenceKeys.fonts, [font]);
    useConfigStore.setState({ orgConfig: BASE_CONFIG });
  });

  describe('step 1 — class details', () => {
    it('shows the class number from the route params', () => {
      renderWizard();
      expect(screen.getByRole('heading', { name: /Detalles de la clase 3/i })).toBeInTheDocument();
    });

    it('lets the user type an objective and advance to step 2', async () => {
      renderWizard();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('Ingresa el objetivo de la clase...'), 'Entender fracciones');
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      expect(screen.getByRole('heading', { name: /Momentos de la clase/i })).toBeInTheDocument();
    });
  });

  describe('step 2 — moments and resources', () => {
    async function advanceToStep2(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
    }

    it('disables the submit button when moments are invalid', async () => {
      renderWizard();
      const user = userEvent.setup();
      await advanceToStep2(user);
      expect(screen.getByRole('button', { name: /Planificar clase/i })).toBeDisabled();
    });

    it('enables submit once each moment has its minimum activities', async () => {
      renderWizard();
      const user = userEvent.setup();
      await advanceToStep2(user);

      await user.click(screen.getByRole('button', { name: 'add-to-apertura' }));
      await user.click(screen.getByRole('button', { name: 'add-to-desarrollo' }));
      await user.click(screen.getByRole('button', { name: 'add-to-cierre' }));

      expect(screen.getByRole('button', { name: /Planificar clase/i })).toBeEnabled();
    });

    it('goes back to step 1 when pressing Anterior', async () => {
      renderWizard();
      const user = userEvent.setup();
      await advanceToStep2(user);
      await user.click(screen.getByRole('button', { name: /Anterior/i }));
      expect(screen.getByRole('heading', { name: /Detalles de la clase 3/i })).toBeInTheDocument();
    });

    it('switches resources_mode when toggling', async () => {
      renderWizard();
      const user = userEvent.setup();
      await advanceToStep2(user);

      expect(screen.getByText('current:global')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'mode-per-moment' }));
      expect(screen.getByText('current:per_moment')).toBeInTheDocument();
    });

    it('submits the plan with moments + global fonts and navigates to the editor', async () => {
      createPlanMock.mockResolvedValue({ id: 55 } as LessonPlan);

      renderWizard();
      const user = userEvent.setup();
      await user.type(screen.getByPlaceholderText('Ingresa el objetivo de la clase...'), 'Objetivo de prueba');
      await advanceToStep2(user);

      await user.click(screen.getByRole('button', { name: 'add-to-apertura' }));
      await user.click(screen.getByRole('button', { name: 'add-to-desarrollo' }));
      await user.click(screen.getByRole('button', { name: 'add-to-cierre' }));

      // Select a global font via the real checkbox
      await user.click(screen.getByLabelText(/Fuente demo/));

      await user.click(screen.getByRole('button', { name: /Planificar clase/i }));

      await waitFor(() => expect(createPlanMock).toHaveBeenCalled());
      const payload = createPlanMock.mock.calls[0]?.[0];
      expect(payload).toMatchObject({
        course_subject_id: 7,
        class_number: 3,
        title: 'Objetivo de prueba',
        resources_mode: 'global',
        fonts: { global: [42] },
      });
      expect(payload.moments.apertura.activities).toEqual([1]);
      expect(payload.moments.desarrollo.activities).toEqual([1]);
      expect(payload.moments.cierre.activities).toEqual([1]);
      expect(navigateMock).toHaveBeenCalledWith('/teacher/plans/55');
    });

    it('omits the fonts field when resources_mode is per_moment', async () => {
      createPlanMock.mockResolvedValue({ id: 60 } as LessonPlan);

      renderWizard();
      const user = userEvent.setup();
      await advanceToStep2(user);

      await user.click(screen.getByRole('button', { name: 'add-to-apertura' }));
      await user.click(screen.getByRole('button', { name: 'add-to-desarrollo' }));
      await user.click(screen.getByRole('button', { name: 'add-to-cierre' }));
      await user.click(screen.getByRole('button', { name: 'mode-per-moment' }));
      await user.click(screen.getByRole('button', { name: /Planificar clase/i }));

      await waitFor(() => expect(createPlanMock).toHaveBeenCalled());
      const payload = createPlanMock.mock.calls[0]?.[0];
      expect(payload.fonts).toBeUndefined();
      expect(payload.resources_mode).toBe('per_moment');
    });

    it('resets the submitting state when create fails and does not navigate', async () => {
      createPlanMock.mockRejectedValue(new Error('boom'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* no-op */
      });

      renderWizard();
      const user = userEvent.setup();
      await advanceToStep2(user);

      await user.click(screen.getByRole('button', { name: 'add-to-apertura' }));
      await user.click(screen.getByRole('button', { name: 'add-to-desarrollo' }));
      await user.click(screen.getByRole('button', { name: 'add-to-cierre' }));
      await user.click(screen.getByRole('button', { name: /Planificar clase/i }));

      await waitFor(() => expect(createPlanMock).toHaveBeenCalled());
      expect(navigateMock).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: /Planificar clase/i })).toBeEnabled();
      errorSpy.mockRestore();
    });
  });
});
