import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { coordinationKeys } from '@/hooks/queries/useCoordinationQueries';
import { Document } from './Document';
import type { CoordinationDocument } from '@/types';

const getByIdMock = vi.fn();
const updateMock = vi.fn();
const generateMock = vi.fn();

vi.mock('@/services/api', () => ({
  coordinationDocumentsApi: {
    getById: (...args: unknown[]) => getByIdMock(...args),
    update: (...args: unknown[]) => updateMock(...args),
    generate: (...args: unknown[]) => generateMock(...args),
  },
}));

vi.mock('@/components/ai/ChatPanel', () => ({
  ChatPanel: () => <div data-testid='chat-panel' />,
}));

vi.mock('@/components/ai/LoadingOrb', () => ({
  LoadingOrb: ({ message }: { message?: string }) => <div data-testid='loading-orb'>{message}</div>,
}));

const mockDocument: CoordinationDocument = {
  id: 1,
  organization_id: 1,
  name: 'Itinerario Matematicas',
  area_id: 100,
  area_name: 'Matematicas',
  start_date: '2026-03-01',
  end_date: '2026-07-01',
  status: 'in_progress',
  sections: {
    resumen: { value: 'Contenido del resumen' },
  },
  topics: [],
  subjects: [],
  org_config: {
    coord_doc_sections: [{ key: 'resumen', label: 'Resumen', type: 'text', ai_prompt: '', required: false }],
  },
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderDocument(docId = '1') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/coordinator/documents/${docId}`]}>
        <Routes>
          <Route path='/coordinator/documents/:id' element={<Document />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Document page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    getByIdMock.mockResolvedValue(mockDocument);
  });

  it('shows loading state while document loads', () => {
    getByIdMock.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        }),
    );
    renderDocument();
    expect(screen.getByTestId('loading-orb')).toBeInTheDocument();
  });

  it('renders document name after load', async () => {
    renderDocument();
    await waitFor(() => {
      expect(screen.getAllByText('Itinerario Matematicas').length).toBeGreaterThan(0);
    });
  });

  it('shows the publish button when not published', async () => {
    renderDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Publicar$/i })).toBeInTheDocument();
    });
  });

  it('shows "Publicado" when document is published', async () => {
    getByIdMock.mockResolvedValueOnce({ ...mockDocument, status: 'published' });
    renderDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publicado/i })).toBeInTheDocument();
    });
  });
});
