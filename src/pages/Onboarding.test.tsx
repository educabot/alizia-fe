import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';
import type { OrgConfig, User, ProfileField, TourStep } from '@/types';

// --- Mocks --------------------------------------------------------------------

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const completeMock = vi.fn();
vi.mock('@/services/api', () => ({
  onboardingApi: {
    complete: (...args: unknown[]) => completeMock(...args),
  },
}));

// Mock the child components to keep the tests focused on the page logic.
vi.mock('@/components/onboarding/ProfileForm', () => ({
  ProfileForm: ({
    fields,
    values,
    onChange,
  }: {
    fields: ProfileField[];
    values: Record<string, string | string[]>;
    onChange: (k: string, v: string | string[]) => void;
  }) => (
    <div data-testid='profile-form'>
      {fields.map((f) => (
        <label key={f.key}>
          {f.label}
          <input
            aria-label={f.label}
            value={String(values[f.key] ?? '')}
            onChange={(e) => onChange(f.key, e.target.value)}
          />
        </label>
      ))}
    </div>
  ),
}));

vi.mock('@/components/onboarding/TourOverlay', () => ({
  TourOverlay: ({
    steps,
    currentStep,
    onNext,
    onSkip,
  }: {
    steps: TourStep[];
    currentStep: number;
    onNext: () => void;
    onSkip: () => void;
  }) => (
    <div data-testid='tour-overlay'>
      <p>
        step {currentStep + 1}/{steps.length}
      </p>
      <button type='button' onClick={onNext}>
        tour-next
      </button>
      <button type='button' onClick={onSkip}>
        tour-skip
      </button>
    </div>
  ),
}));

import { Onboarding } from './Onboarding';

// --- Fixtures -----------------------------------------------------------------

const teacherUser: User = {
  id: 1,
  name: 'Teacher',
  email: 't@t.com',
  avatar: '',
  roles: ['teacher'],
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

function configWith(onboarding: OrgConfig['onboarding']): OrgConfig {
  return { ...BASE_CONFIG, onboarding };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>,
  );
}

// --- Tests --------------------------------------------------------------------

describe('Onboarding page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: teacherUser });
    useConfigStore.setState({
      orgConfig: configWith({
        allow_skip: true,
        profile_fields: [
          { key: 'school', label: 'Escuela', type: 'text', required: true },
          { key: 'grade', label: 'Grado', type: 'text', required: false },
        ],
        tour_steps: [
          { target: '#a', title: 'Uno', description: 'Primer paso' },
          { target: '#b', title: 'Dos', description: 'Segundo paso' },
        ],
      }),
    });
  });

  describe('welcome step', () => {
    it('shows a greeting with the configured platform name', () => {
      useConfigStore.setState({
        orgConfig: {
          ...BASE_CONFIG,
          visual_identity: { platform_name: 'Cosmos' },
          onboarding: { allow_skip: true, profile_fields: [], tour_steps: [] },
        },
      });
      renderPage();
      expect(screen.getByRole('heading', { name: /Bienvenido a Cosmos/i })).toBeInTheDocument();
    });

    it('falls back to "Alizia" when no platform_name is configured', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /Bienvenido a Alizia/i })).toBeInTheDocument();
    });

    it('hides the skip link when allow_skip is false', () => {
      useConfigStore.setState({
        orgConfig: configWith({ allow_skip: false, profile_fields: [], tour_steps: [] }),
      });
      renderPage();
      expect(screen.queryByRole('button', { name: /Omitir por ahora/i })).not.toBeInTheDocument();
    });

    it('advances to the profile step when profile fields exist', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    });

    it('skips straight to the tour step when there are no profile fields', async () => {
      useConfigStore.setState({
        orgConfig: configWith({
          allow_skip: true,
          profile_fields: [],
          tour_steps: [{ target: '#x', title: 't', description: 'd' }],
        }),
      });
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      expect(screen.getByTestId('tour-overlay')).toBeInTheDocument();
    });

    it('jumps to the done step when there is neither profile nor tour', async () => {
      useConfigStore.setState({
        orgConfig: configWith({ allow_skip: true, profile_fields: [], tour_steps: [] }),
      });
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      expect(screen.getByRole('heading', { name: /Todo listo/i })).toBeInTheDocument();
    });
  });

  describe('profile step', () => {
    it('disables the next button until required fields are filled', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));

      const next = screen.getByRole('button', { name: /Siguiente/i });
      expect(next).toBeDisabled();

      await user.type(screen.getByLabelText('Escuela'), 'Escuela 10');
      expect(screen.getByRole('button', { name: /Siguiente/i })).toBeEnabled();
    });

    it('moves to the tour step after submitting the profile', async () => {
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      await user.type(screen.getByLabelText('Escuela'), 'Escuela 10');
      await user.click(screen.getByRole('button', { name: /Siguiente/i }));

      expect(screen.getByTestId('tour-overlay')).toBeInTheDocument();
    });

    it('skipping from the profile step completes onboarding and navigates', async () => {
      completeMock.mockResolvedValue(undefined);
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      await user.click(screen.getByRole('button', { name: /^Omitir$/i }));

      await waitFor(() => expect(completeMock).toHaveBeenCalled());
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('tour step', () => {
    it('advances tour steps via the onNext callback', async () => {
      useConfigStore.setState({
        orgConfig: configWith({
          allow_skip: true,
          profile_fields: [],
          tour_steps: [
            { target: '#a', title: 'Uno', description: 'P' },
            { target: '#b', title: 'Dos', description: 'S' },
          ],
        }),
      });
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      expect(screen.getByText('step 1/2')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'tour-next' }));
      expect(screen.getByText('step 2/2')).toBeInTheDocument();

      // Last step -> move to done
      await user.click(screen.getByRole('button', { name: 'tour-next' }));
      expect(screen.getByRole('heading', { name: /Todo listo/i })).toBeInTheDocument();
    });

    it('skipping the tour jumps straight to the done step', async () => {
      useConfigStore.setState({
        orgConfig: configWith({
          allow_skip: true,
          profile_fields: [],
          tour_steps: [{ target: '#a', title: 'Uno', description: 'P' }],
        }),
      });
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      await user.click(screen.getByRole('button', { name: 'tour-skip' }));
      expect(screen.getByRole('heading', { name: /Todo listo/i })).toBeInTheDocument();
    });
  });

  describe('done step', () => {
    it('completes onboarding and navigates when clicking "Ir al dashboard"', async () => {
      completeMock.mockResolvedValue(undefined);
      useConfigStore.setState({
        orgConfig: configWith({ allow_skip: true, profile_fields: [], tour_steps: [] }),
      });
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      await user.click(screen.getByRole('button', { name: /Ir al dashboard/i }));

      await waitFor(() => expect(completeMock).toHaveBeenCalled());
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    it('still navigates when the complete API call fails (mock-mode fallback)', async () => {
      completeMock.mockRejectedValue(new Error('offline'));
      useConfigStore.setState({
        orgConfig: configWith({ allow_skip: true, profile_fields: [], tour_steps: [] }),
      });
      renderPage();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Comenzar/i }));
      await user.click(screen.getByRole('button', { name: /Ir al dashboard/i }));

      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/', { replace: true }));
    });
  });
});
