import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import type { CoordinationDocument, Area, PaginatedResponse } from '@/types';

const listMock = vi.fn();

vi.mock('@/services/api', () => ({
  coordinationDocumentsApi: {
    list: (...args: unknown[]) => listMock(...args),
  },
}));

vi.mock('@/hooks/useOrgConfig', () => ({
  useNomenclature: (key: string) =>
    ({
      coordination_document: 'Documento de coordinacion',
      coordination_document_plural: 'Documentos de coordinacion',
    })[key] ?? key,
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import { CoordinatorDocuments } from './CoordinatorDocuments';

function makeDoc(id: number, overrides: Partial<CoordinationDocument> = {}): CoordinationDocument {
  return {
    id,
    organization_id: 1,
    name: `Doc ${id}`,
    area_id: 1,
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
    ...overrides,
  };
}

const mockAreas: Area[] = [
  { id: 1, name: 'Matematicas', created_at: '2026-01-01' },
  { id: 2, name: 'Lengua', created_at: '2026-01-01' },
];

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CoordinatorDocuments />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function paged<T>(items: T[], more = false): PaginatedResponse<T> {
  return { items, more };
}

describe('CoordinatorDocuments page (G-5.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(referenceKeys.areas, mockAreas);
  });

  it('renders the title and Nuevo button', async () => {
    listMock.mockResolvedValue(paged([makeDoc(1)]));
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText(/Documentos de coordinacion/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByRole('button', { name: /Nuevo documento/i }).length).toBeGreaterThan(0);
  });

  it('lists documents returned by the API', async () => {
    listMock.mockResolvedValue(paged([makeDoc(1, { name: 'Doc A' }), makeDoc(2, { name: 'Doc B' })]));
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Doc A')).toBeInTheDocument();
    });
    expect(screen.getByText('Doc B')).toBeInTheDocument();
  });

  it('shows the empty state when the list is empty and no filters applied', async () => {
    listMock.mockResolvedValue(paged([]));
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Aun no hay documentos de coordinacion/i)).toBeInTheDocument();
    });
  });

  it('shows "Sin resultados" when filters return nothing', async () => {
    // Initial load: results, then filter change → empty
    listMock.mockResolvedValueOnce(paged([makeDoc(1)]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Doc 1')).toBeInTheDocument());

    listMock.mockResolvedValueOnce(paged([]));
    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/Filtrar por estado/i));
    await user.click(screen.getByRole('option', { name: /^Publicado$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sin resultados/i)).toBeInTheDocument();
    });
  });

  it('reloads with area_id filter when an area is selected', async () => {
    listMock.mockResolvedValue(paged([]));
    renderPage();
    await waitFor(() => expect(listMock).toHaveBeenCalled());

    const user = userEvent.setup();
    await user.click(screen.getByLabelText(/Filtrar por area/i));
    await user.click(screen.getByRole('option', { name: 'Matematicas' }));

    await waitFor(() => {
      const lastCall = listMock.mock.calls.at(-1)?.[0];
      expect(lastCall).toMatchObject({ area_id: 1 });
    });
  });

  it('shows "Cargar mas" button when hasMore is true and appends results', async () => {
    listMock.mockResolvedValueOnce(paged([makeDoc(1)], true));
    renderPage();

    await waitFor(() => expect(screen.getByText('Doc 1')).toBeInTheDocument());
    const loadMore = await screen.findByRole('button', { name: /Cargar mas documentos/i });

    listMock.mockResolvedValueOnce(paged([makeDoc(2)], false));
    const user = userEvent.setup();
    await user.click(loadMore);

    await waitFor(() => {
      expect(screen.getByText('Doc 2')).toBeInTheDocument();
    });
    expect(screen.getByText('Doc 1')).toBeInTheDocument();
  });

  it('shows error state with retry when the API fails', async () => {
    listMock.mockRejectedValueOnce(new Error('network down'));
    renderPage();

    const retryBtn = await screen.findByRole('button', { name: /reintentar/i });

    // Retry succeeds → list renders
    listMock.mockResolvedValueOnce(paged([makeDoc(42, { name: 'Recovered' })]));
    const user = userEvent.setup();
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Recovered')).toBeInTheDocument();
    });
  });

  it('navigates to new-document route when "Nuevo" is clicked', async () => {
    listMock.mockResolvedValue(paged([makeDoc(1)]));
    renderPage();
    await waitFor(() => expect(screen.getByText('Doc 1')).toBeInTheDocument());

    const buttons = screen.getAllByRole('button', { name: /Nuevo documento/i });
    const user = userEvent.setup();
    await user.click(buttons[0]);

    expect(navigateMock).toHaveBeenCalledWith('/coordinator/documents/new');
  });
});
