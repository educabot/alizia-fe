import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { resourceKeys } from '@/hooks/queries/useResourceQueries';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import type { Font, Resource, ResourceType } from '@/types';

// --- Mocks --------------------------------------------------------------------

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const createMock = vi.fn();
vi.mock('@/services/api', () => ({
  resourcesApi: {
    list: vi.fn().mockResolvedValue({ items: [], more: false }),
    create: (...args: unknown[]) => createMock(...args),
  },
  resourceTypesApi: {
    list: vi.fn().mockResolvedValue({ items: [], more: false }),
  },
}));

// --- Fixtures -----------------------------------------------------------------

const textType: ResourceType = {
  id: 1,
  key: 'text',
  name: 'Texto explicativo',
  description: 'Un texto sencillo sin fuente.',
  requires_font: false,
  prompt: '',
  output_schema: {},
  is_custom: false,
};

const quizType: ResourceType = {
  id: 2,
  key: 'quiz',
  name: 'Cuestionario',
  description: 'Preguntas sobre una fuente.',
  requires_font: true,
  prompt: '',
  output_schema: {},
  is_custom: false,
};

const font: Font = {
  id: 10,
  name: 'Libro A',
  description: 'Fuente demo',
  area_id: 1,
  created_at: '2026-01-01',
};

function makeResource(id: number): Resource {
  return {
    id,
    title: 'x',
    resource_type_id: 1,
    status: 'draft',
    content: {},
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  } as Resource;
}

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ResourceCreate />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = createTestQueryClient();
  queryClient.setQueryData(resourceKeys.types, [textType, quizType]);
  queryClient.setQueryData(referenceKeys.fonts, [font]);
});

import { ResourceCreate } from './ResourceCreate';

// --- Tests --------------------------------------------------------------------

describe('ResourceCreate page', () => {
  it('lists the resource types from the query cache', () => {
    renderPage();
    expect(screen.getByText('Texto explicativo')).toBeInTheDocument();
    expect(screen.getByText('Cuestionario')).toBeInTheDocument();
  });

  it('prefills the title with "<type> - Nuevo" after selecting a type', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Texto explicativo/ }));
    const titleInput = screen.getByPlaceholderText('Titulo del recurso...') as HTMLInputElement;
    expect(titleInput.value).toBe('Texto explicativo - Nuevo');
  });

  it('creates a resource for a simple (non-font) type and navigates to the editor', async () => {
    createMock.mockResolvedValue(makeResource(55));
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Texto explicativo/ }));
    await user.click(screen.getByRole('button', { name: /^Siguiente$/i }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        title: 'Texto explicativo - Nuevo',
        resource_type_id: 1,
        font_id: undefined,
      });
    });
    expect(navigateMock).toHaveBeenCalledWith('/resources/55', { replace: true });
  });

  it('requires a font selection before enabling the create button for font types', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Cuestionario/ }));
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));

    // On step 2 the button is disabled until a font is picked
    const createBtn = screen.getByRole('button', { name: /^Siguiente$/i });
    expect(createBtn).toBeDisabled();
  });

  it('creates a resource with font_id when the type requires a font', async () => {
    createMock.mockResolvedValue(makeResource(99));
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Cuestionario/ }));
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    await user.click(screen.getByText('Libro A'));
    await user.click(screen.getByRole('button', { name: /^Siguiente$/i }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        title: 'Cuestionario - Nuevo',
        resource_type_id: 2,
        font_id: 10,
      });
    });
    expect(navigateMock).toHaveBeenCalledWith('/resources/99', { replace: true });
  });

  it('lets the user go back from step 2 to step 1', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Cuestionario/ }));
    await user.click(screen.getByRole('button', { name: /Siguiente/i }));
    expect(screen.getByRole('heading', { name: /Fuente bibliografica/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Anterior/i }));
    expect(screen.getByRole('heading', { name: /Tipo de recurso/i })).toBeInTheDocument();
  });

  it('resets the submitting state and does not navigate when create fails', async () => {
    createMock.mockRejectedValue(new Error('boom'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /* no-op */
    });

    renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Texto explicativo/ }));
    await user.click(screen.getByRole('button', { name: /^Siguiente$/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalled());
    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^Siguiente$/i })).toBeEnabled();

    errorSpy.mockRestore();
  });
});
