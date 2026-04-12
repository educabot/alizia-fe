import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { resourceKeys } from '@/hooks/queries/useResourceQueries';
import type { Resource, ResourceType } from '@/types';

const getByIdMock = vi.fn();
const updateMock = vi.fn();

vi.mock('@/services/api', () => ({
  resourcesApi: {
    getById: (...args: unknown[]) => getByIdMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    generate: vi.fn(),
  },
  resourceTypesApi: {
    list: vi.fn().mockResolvedValue({ items: [], more: false }),
  },
}));

const toastSuccessMock = vi.fn();
const showApiErrorMock = vi.fn();
vi.mock('@/lib/toast', () => ({
  toastSuccess: (msg: string) => toastSuccessMock(msg),
  showApiError: (err: unknown) => showApiErrorMock(err),
}));

vi.mock('@/components/ai/ChatPanel', () => ({
  ChatPanel: () => <div data-testid='chat-panel' />,
}));

vi.mock('@/components/ai/LoadingOrb', () => ({
  LoadingOrb: ({ message }: { message?: string }) => <div data-testid='loading-orb'>{message}</div>,
}));

vi.mock('@/components/resources/DynamicContentRenderer', () => ({
  DynamicContentRenderer: ({
    content,
    onChange,
    readOnly,
  }: {
    content: Record<string, unknown>;
    onChange: (c: Record<string, unknown>) => void;
    readOnly: boolean;
  }) => (
    <div data-testid='content-renderer' data-readonly={readOnly ? 'true' : 'false'}>
      <span>value:{String(content.texto ?? '')}</span>
      <button type='button' onClick={() => onChange({ texto: 'editado' })}>
        edit
      </button>
    </div>
  ),
}));

import { ResourceEditor } from './ResourceEditor';

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: 1,
    resource_type_id: 10,
    resource_type_name: 'Actividad',
    title: 'Mi recurso',
    content: { texto: 'original' },
    user_id: 1,
    status: 'draft',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  };
}

const mockType: ResourceType = {
  id: 10,
  key: 'actividad',
  name: 'Actividad',
  description: '',
  requires_font: false,
  prompt: '',
  output_schema: {
    texto: { type: 'string', label: 'Texto' },
  },
  is_custom: false,
};

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderPage(id = '1') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/resources/${id}`]}>
        <Routes>
          <Route path='/resources/:id' element={<ResourceEditor />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ResourceEditor page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    queryClient.setQueryData(resourceKeys.types, [mockType]);
    getByIdMock.mockResolvedValue(makeResource());
  });

  it('shows loading orb while the resource is loading', () => {
    getByIdMock.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves — keeps the page stuck in loading state */
        }),
    );
    renderPage();
    expect(screen.getByTestId('loading-orb')).toBeInTheDocument();
  });

  it('renders the title and content once loaded', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Mi recurso').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('value:original')).toBeInTheDocument();
  });

  it('shows the Guardar button after editing content and saves on click', async () => {
    updateMock.mockResolvedValue({});
    renderPage();
    await waitFor(() => expect(screen.getByTestId('content-renderer')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'edit' }));

    const saveBtn = await screen.findByRole('button', { name: /Guardar/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(1, { content: { texto: 'editado' } });
    });
    expect(toastSuccessMock).toHaveBeenCalledWith('Cambios guardados');
  });

  it('calls showApiError when save fails', async () => {
    updateMock.mockRejectedValue(new Error('boom'));
    renderPage();
    await waitFor(() => expect(screen.getByTestId('content-renderer')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'edit' }));
    await user.click(await screen.findByRole('button', { name: /Guardar/i }));

    await waitFor(() => expect(showApiErrorMock).toHaveBeenCalled());
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it('publishes the resource and shows a toast', async () => {
    updateMock.mockResolvedValue({});
    // After publish, refetch returns active status
    getByIdMock
      .mockResolvedValueOnce(makeResource({ status: 'draft' }))
      .mockResolvedValueOnce(makeResource({ status: 'active' }));
    renderPage();
    await waitFor(() => expect(screen.getByTestId('content-renderer')).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Publicar/i }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(1, { status: 'active' });
    });
    expect(toastSuccessMock).toHaveBeenCalledWith('Recurso publicado');
  });

  it('marks the content renderer as read-only when the resource is published', async () => {
    getByIdMock.mockResolvedValue(makeResource({ status: 'active' }));
    renderPage();
    await waitFor(() => {
      const renderer = screen.getByTestId('content-renderer');
      expect(renderer.getAttribute('data-readonly')).toBe('true');
    });
    // Publish button should now say "Publicado" and be disabled
    const btn = screen.getByRole('button', { name: /Publicado/i });
    expect(btn).toBeDisabled();
  });

  it('disables the publish button when there is no content', async () => {
    getByIdMock.mockResolvedValue(makeResource({ content: {} }));
    renderPage();
    await waitFor(() => expect(screen.getByTestId('content-renderer')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Publicar/i })).toBeDisabled();
  });
});
