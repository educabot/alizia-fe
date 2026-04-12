import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import type { Area, PaginatedResponse } from '@/types';

// --- Mocks --------------------------------------------------------------------

const listMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();

vi.mock('@/services/api', () => ({
  areasApi: {
    list: (...args: unknown[]) => listMock(...args),
    create: (...args: unknown[]) => createMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    delete: (...args: unknown[]) => deleteMock(...args),
  },
}));

const toastSuccessMock = vi.fn();
const showApiErrorMock = vi.fn();
vi.mock('@/lib/toast', () => ({
  toastSuccess: (msg: string) => toastSuccessMock(msg),
  showApiError: (err: unknown) => showApiErrorMock(err),
}));

import { AdminAreas } from './AdminAreas';

// --- Fixtures -----------------------------------------------------------------

function makeArea(id: number, overrides: Partial<Area> = {}): Area {
  return {
    id,
    name: `Area ${id}`,
    description: undefined,
    created_at: '2026-01-01',
    ...overrides,
  };
}

function paged<T>(items: T[], more = false): PaginatedResponse<T> {
  return { items, more };
}

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminAreas />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function openCreateDialog(user: ReturnType<typeof userEvent.setup>) {
  // There may be two "Nueva area" buttons (header + empty-state) — click the
  // first one which is always visible in the header.
  const buttons = screen.getAllByRole('button', { name: /Nueva area/i });
  await user.click(buttons[0]);
  return screen.getByRole('dialog');
}

// --- Tests --------------------------------------------------------------------

describe('AdminAreas page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  describe('list rendering', () => {
    it('shows an area list returned by the API', async () => {
      listMock.mockResolvedValue(
        paged([
          makeArea(1, { name: 'Ciencias', description: 'Biologia + Fisica' }),
          makeArea(2, { name: 'Matematicas' }),
        ]),
      );
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Ciencias')).toBeInTheDocument();
      });
      expect(screen.getByText('Biologia + Fisica')).toBeInTheDocument();
      expect(screen.getByText('Matematicas')).toBeInTheDocument();
    });

    it('shows the empty state with a CTA when there are no areas', async () => {
      listMock.mockResolvedValue(paged([]));
      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Aun no hay areas/i)).toBeInTheDocument();
      });
      // CTA button in the empty state
      expect(screen.getAllByRole('button', { name: /Nueva area/i }).length).toBeGreaterThan(1);
    });

    it('shows an error state with retry when the API fails', async () => {
      listMock.mockRejectedValueOnce(new Error('network down'));
      renderPage();

      const retry = await screen.findByRole('button', { name: /reintentar/i });

      listMock.mockResolvedValueOnce(paged([makeArea(42, { name: 'Recovered' })]));
      const user = userEvent.setup();
      await user.click(retry);

      await waitFor(() => {
        expect(screen.getByText('Recovered')).toBeInTheDocument();
      });
    });

    it('renders a "Cargar mas" button when hasMore is true', async () => {
      listMock.mockResolvedValueOnce(paged([makeArea(1)], true));
      renderPage();

      await waitFor(() => expect(screen.getByText('Area 1')).toBeInTheDocument());
      expect(screen.getByRole('button', { name: /Cargar mas areas/i })).toBeInTheDocument();
    });
  });

  describe('create flow', () => {
    it('submits a new area and refreshes the list', async () => {
      listMock.mockResolvedValueOnce(paged([]));
      createMock.mockResolvedValue(makeArea(99, { name: 'Nueva area' }));
      // After create, reload returns the created area
      listMock.mockResolvedValueOnce(paged([makeArea(99, { name: 'Nueva area' })]));

      renderPage();
      await waitFor(() => expect(listMock).toHaveBeenCalled());

      const user = userEvent.setup();
      const dialog = await openCreateDialog(user);

      await user.type(within(dialog).getByLabelText(/Nombre/i), 'Ciencias');
      await user.type(within(dialog).getByLabelText(/Descripcion/i), 'Biologia y Fisica');
      await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

      await waitFor(() => {
        expect(createMock).toHaveBeenCalledWith({
          name: 'Ciencias',
          description: 'Biologia y Fisica',
        });
      });

      expect(toastSuccessMock).toHaveBeenCalledWith('Area creada');
      // Dialog closes after success
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('keeps the dialog open and shows an error when create fails', async () => {
      listMock.mockResolvedValue(paged([]));
      createMock.mockRejectedValue(new Error('boom'));

      renderPage();
      await waitFor(() => expect(listMock).toHaveBeenCalled());

      const user = userEvent.setup();
      const dialog = await openCreateDialog(user);
      await user.type(within(dialog).getByLabelText(/Nombre/i), 'Invalid');
      await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

      await waitFor(() => expect(showApiErrorMock).toHaveBeenCalled());
      expect(toastSuccessMock).not.toHaveBeenCalled();
      // Dialog is still mounted so the user can retry
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('disables the submit button when the name is blank', async () => {
      listMock.mockResolvedValue(paged([]));
      renderPage();
      await waitFor(() => expect(listMock).toHaveBeenCalled());

      const user = userEvent.setup();
      const dialog = await openCreateDialog(user);
      expect(within(dialog).getByRole('button', { name: 'Crear' })).toBeDisabled();
    });

    it('trims whitespace and omits empty description from the payload', async () => {
      listMock.mockResolvedValue(paged([]));
      createMock.mockResolvedValue(makeArea(1));

      renderPage();
      await waitFor(() => expect(listMock).toHaveBeenCalled());

      const user = userEvent.setup();
      const dialog = await openCreateDialog(user);
      await user.type(within(dialog).getByLabelText(/Nombre/i), '  Padded  ');
      await user.click(within(dialog).getByRole('button', { name: 'Crear' }));

      await waitFor(() => {
        expect(createMock).toHaveBeenCalledWith({
          name: 'Padded',
          description: undefined,
        });
      });
    });
  });

  describe('edit flow', () => {
    it('pre-fills the dialog and submits an update', async () => {
      const existing = makeArea(7, { name: 'Old name', description: 'Old desc' });
      listMock.mockResolvedValueOnce(paged([existing]));
      updateMock.mockResolvedValue({ ...existing, name: 'New name' });
      listMock.mockResolvedValueOnce(paged([{ ...existing, name: 'New name' }]));

      renderPage();
      await waitFor(() => expect(screen.getByText('Old name')).toBeInTheDocument());

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Editar Old name/i }));

      const dialog = screen.getByRole('dialog');
      const nameInput = within(dialog).getByLabelText(/Nombre/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Old name');

      await user.clear(nameInput);
      await user.type(nameInput, 'New name');
      await user.click(within(dialog).getByRole('button', { name: /Guardar cambios/i }));

      await waitFor(() => {
        expect(updateMock).toHaveBeenCalledWith(7, {
          name: 'New name',
          description: 'Old desc',
        });
      });

      expect(toastSuccessMock).toHaveBeenCalledWith('Area actualizada');
    });
  });

  describe('delete flow', () => {
    it('opens a confirmation dialog and deletes on confirm', async () => {
      const existing = makeArea(5, { name: 'Removable' });
      listMock.mockResolvedValueOnce(paged([existing]));
      deleteMock.mockResolvedValue(undefined);
      listMock.mockResolvedValueOnce(paged([]));

      renderPage();
      await waitFor(() => expect(screen.getByText('Removable')).toBeInTheDocument());

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Eliminar Removable/i }));

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/no se puede deshacer/i)).toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: /^Eliminar$/i }));

      await waitFor(() => {
        expect(deleteMock).toHaveBeenCalledWith(5);
      });

      expect(toastSuccessMock).toHaveBeenCalledWith('Area eliminada');
    });

    it('does not delete when the user cancels the confirmation', async () => {
      const existing = makeArea(5, { name: 'Removable' });
      listMock.mockResolvedValue(paged([existing]));
      renderPage();
      await waitFor(() => expect(screen.getByText('Removable')).toBeInTheDocument());

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Eliminar Removable/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /Cancelar/i }));

      expect(deleteMock).not.toHaveBeenCalled();
    });

    it('calls showApiError and keeps the dialog mounted when delete fails', async () => {
      const existing = makeArea(5, { name: 'Removable' });
      listMock.mockResolvedValue(paged([existing]));
      deleteMock.mockRejectedValue(new Error('boom'));

      renderPage();
      await waitFor(() => expect(screen.getByText('Removable')).toBeInTheDocument());

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Eliminar Removable/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /^Eliminar$/i }));

      await waitFor(() => expect(showApiErrorMock).toHaveBeenCalled());
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });
});
