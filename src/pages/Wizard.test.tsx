import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import type { Area, Subject, Topic } from '@/types';

// --- Mocks --------------------------------------------------------------------

const createMock = vi.fn();
vi.mock('@/services/api', () => ({
  coordinationDocumentsApi: {
    create: (...args: unknown[]) => createMock(...args),
    list: vi.fn().mockResolvedValue({ items: [], more: false }),
  },
}));

const toastSuccessMock = vi.fn();
const showApiErrorMock = vi.fn();
vi.mock('@/lib/toast', () => ({
  toastSuccess: (msg: string) => toastSuccessMock(msg),
  showApiError: (err: unknown) => showApiErrorMock(err),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// DateInput in prod is a Popover + Calendar picker. For the wizard test, we
// replace it with a plain <input> so we can type dates directly instead of
// driving the whole popover flow. The date picker has its own tests.
vi.mock('@/components/ui/date-input', () => ({
  DateInput: ({
    value,
    onChange,
    placeholder,
  }: {
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    placeholder?: string;
  }) => (
    <input
      type='text'
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange?.({ target: { value: e.target.value } })}
    />
  ),
}));

// Simplify TopicSelector + SubjectClassConfig so we don't test their internals
// here — they have their own test suites.
vi.mock('@/components/coordination', async () => {
  const actual = await vi.importActual<typeof import('@/components/coordination')>('@/components/coordination');
  return {
    ...actual,
    TopicSelector: ({ selected, onSelect }: { selected: number[]; onSelect: (ids: number[]) => void }) => (
      <div data-testid='topic-selector'>
        <button type='button' onClick={() => onSelect(selected.length > 0 ? [] : [1, 2])}>
          Toggle topics
        </button>
        <span>selected:{selected.join(',')}</span>
      </div>
    ),
    SubjectClassConfig: ({
      subjects,
      value,
      onChange,
      availableTopicIds,
      mode,
    }: {
      subjects: Subject[];
      value: Record<string, { class_count: number; topic_ids: number[] }>;
      onChange: (v: Record<string, { class_count: number; topic_ids: number[] }>) => void;
      availableTopicIds: number[];
      mode: 'class_count' | 'topics';
    }) => (
      <div data-testid={`subject-config-${mode}`}>
        {subjects.map((s) => (
          <div key={s.id} data-testid={`subject-${s.id}`}>
            {s.name}
          </div>
        ))}
        <button
          type='button'
          onClick={() => {
            const next: Record<string, { class_count: number; topic_ids: number[] }> = {};
            for (const s of subjects) {
              next[String(s.id)] = { class_count: 3, topic_ids: availableTopicIds };
            }
            onChange(next);
          }}
        >
          fill-all
        </button>
        <span>values:{Object.keys(value).length}</span>
      </div>
    ),
    allSubjectsHaveTopics: actual.allSubjectsHaveTopics,
    buildInitialSubjectConfig: actual.buildInitialSubjectConfig,
  };
});

import { Wizard } from './Wizard';

// --- Fixtures -----------------------------------------------------------------

const mockAreas: Area[] = [
  { id: 1, name: 'Matematicas', created_at: '2026-01-01' },
  { id: 2, name: 'Lengua', created_at: '2026-01-01' },
];

const mockSubjects: Subject[] = [
  { id: 10, name: 'Algebra', area_id: 1, area_name: 'Matematicas', created_at: '2026-01-01' },
  { id: 11, name: 'Geometria', area_id: 1, area_name: 'Matematicas', created_at: '2026-01-01' },
  { id: 20, name: 'Literatura', area_id: 2, area_name: 'Lengua', created_at: '2026-01-01' },
];

const mockTopics: Topic[] = [
  { id: 1, name: 'Ecuaciones', level: 1, parent_id: null, children: [] },
  { id: 2, name: 'Funciones', level: 1, parent_id: null, children: [] },
];

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderWizard(path = '/coordinator/courses/5/documents/new') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path='/coordinator/courses/:id/documents/new' element={<Wizard />} />
          <Route path='/coordinator/documents/new' element={<Wizard />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// --- Tests --------------------------------------------------------------------

describe('Wizard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(referenceKeys.areas, mockAreas);
    queryClient.setQueryData(referenceKeys.subjects, mockSubjects);
    queryClient.setQueryData(referenceKeys.topics, mockTopics);
  });

  describe('Step 1 — area + topics', () => {
    it('renders the step 1 heading and area selector', () => {
      renderWizard();
      expect(screen.getByRole('heading', { name: /Selecciona el area y los temas/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('disables "Siguiente" until an area and topics are selected', async () => {
      renderWizard();
      const next = screen.getByRole('button', { name: /Siguiente/i });
      expect(next).toBeDisabled();

      const user = userEvent.setup();
      // Select area — combobox is a native <select>
      await user.selectOptions(screen.getByRole('combobox'), '1');
      // Topic selector appears; still no topics selected
      expect(next).toBeDisabled();

      await user.click(screen.getByRole('button', { name: /Toggle topics/i }));
      expect(next).not.toBeDisabled();
    });

    it('advances to step 2 when "Siguiente" is clicked', async () => {
      renderWizard();
      const user = userEvent.setup();
      await user.selectOptions(screen.getByRole('combobox'), '1');
      await user.click(screen.getByRole('button', { name: /Toggle topics/i }));
      await user.click(screen.getByRole('button', { name: /Siguiente/i }));

      expect(screen.getByRole('heading', { name: /Fechas y clases/i })).toBeInTheDocument();
    });
  });

  describe('Step 2 — dates + subjects', () => {
    async function advanceToStep2() {
      const user = userEvent.setup();
      await user.selectOptions(screen.getByRole('combobox'), '1');
      await user.click(screen.getByRole('button', { name: /Toggle topics/i }));
      await user.click(screen.getByRole('button', { name: /Siguiente/i }));
      return user;
    }

    it('only lists subjects for the selected area', async () => {
      renderWizard();
      await advanceToStep2();
      expect(screen.getByTestId('subject-10')).toBeInTheDocument();
      expect(screen.getByTestId('subject-11')).toBeInTheDocument();
      expect(screen.queryByTestId('subject-20')).not.toBeInTheDocument();
    });

    it('disables "Siguiente" until both dates are filled', async () => {
      renderWizard();
      const user = await advanceToStep2();
      const next = screen.getByRole('button', { name: /Siguiente/i });
      expect(next).toBeDisabled();

      const inputs = screen.getAllByPlaceholderText('DD/MM/AAAA');
      await user.type(inputs[0], '01/03/2026');
      expect(next).toBeDisabled();
      await user.type(inputs[1], '01/07/2026');
      await waitFor(() => expect(next).not.toBeDisabled());
    });

    it('goes back to step 1 when clicking "Anterior"', async () => {
      renderWizard();
      const user = await advanceToStep2();
      await user.click(screen.getByRole('button', { name: /Anterior/i }));
      expect(screen.getByRole('heading', { name: /Selecciona el area y los temas/i })).toBeInTheDocument();
    });
  });

  describe('Step 3 — create submission', () => {
    async function advanceToStep3() {
      const user = userEvent.setup();
      // Step 1
      await user.selectOptions(screen.getByRole('combobox'), '1');
      await user.click(screen.getByRole('button', { name: /Toggle topics/i }));
      await user.click(screen.getByRole('button', { name: /Siguiente/i }));
      // Step 2
      const inputs = screen.getAllByPlaceholderText('DD/MM/AAAA');
      await user.type(inputs[0], '01/03/2026');
      await user.type(inputs[1], '01/07/2026');
      await user.click(screen.getByRole('button', { name: /Siguiente/i }));
      return user;
    }

    it('disables "Crear documento" until all subjects have topics', async () => {
      renderWizard();
      await advanceToStep3();
      expect(screen.getByRole('button', { name: /Crear documento/i })).toBeDisabled();
    });

    it('submits the document with the collected data and navigates to it', async () => {
      createMock.mockResolvedValue({ id: 42 });
      renderWizard();
      const user = await advanceToStep3();

      await user.click(screen.getByRole('button', { name: 'fill-all' }));
      const create = screen.getByRole('button', { name: /Crear documento/i });
      await waitFor(() => expect(create).not.toBeDisabled());
      await user.click(create);

      await waitFor(() => {
        expect(createMock).toHaveBeenCalledTimes(1);
      });
      const payload = createMock.mock.calls[0][0];
      expect(payload).toMatchObject({
        name: 'Itinerario Matematicas',
        area_id: 1,
        start_date: '01/03/2026',
        end_date: '01/07/2026',
        topic_ids: [1, 2],
      });
      expect(payload.subjects).toHaveLength(2);
      expect(payload.subjects[0]).toMatchObject({ class_count: 3, topic_ids: [1, 2] });

      expect(toastSuccessMock).toHaveBeenCalledWith('Documento creado');
      expect(navigateMock).toHaveBeenCalledWith('/coordinator/documents/42');
    });

    it('calls showApiError and re-enables the button when create fails', async () => {
      createMock.mockRejectedValue(new Error('boom'));
      renderWizard();
      const user = await advanceToStep3();
      await user.click(screen.getByRole('button', { name: 'fill-all' }));

      const create = screen.getByRole('button', { name: /Crear documento/i });
      await waitFor(() => expect(create).not.toBeDisabled());
      await user.click(create);

      await waitFor(() => expect(showApiErrorMock).toHaveBeenCalled());
      expect(toastSuccessMock).not.toHaveBeenCalled();
      expect(navigateMock).not.toHaveBeenCalled();
      // Button re-enabled so user can retry
      expect(create).not.toBeDisabled();
    });
  });

  describe('back URL resolution', () => {
    it('navigates back to the course page when entered with a courseId', async () => {
      renderWizard('/coordinator/courses/5/documents/new');
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Cerrar wizard/i }));
      expect(navigateMock).toHaveBeenCalledWith('/coordinator/courses/5');
    });

    it('navigates back to the documents list when entered without a courseId', async () => {
      renderWizard('/coordinator/documents/new');
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Cerrar wizard/i }));
      expect(navigateMock).toHaveBeenCalledWith('/coordinator/documents');
    });
  });
});
