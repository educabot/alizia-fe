import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createTestQueryClient } from '@/test-utils';
import { referenceKeys } from '@/hooks/queries/useReferenceQueries';
import { useAuthStore } from '@/store/authStore';
import { AdminHome } from './AdminHome';

let queryClient: ReturnType<typeof createTestQueryClient>;

function renderHome() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminHome', () => {
  beforeEach(() => {
    queryClient = createTestQueryClient();
    useAuthStore.setState({
      user: { id: 1, name: 'Ana Admin', email: 'a@t.com', avatar: '', roles: ['admin'] },
    });
    queryClient.setQueryData(referenceKeys.areas, [
      { id: 1, name: 'Ciencias', created_at: '2026-01-01' },
      { id: 2, name: 'Matematicas', created_at: '2026-01-01' },
    ]);
    queryClient.setQueryData(referenceKeys.subjects, []);
    queryClient.setQueryData(referenceKeys.courses, []);
    queryClient.setQueryData(referenceKeys.topics, []);
  });

  it('greets the admin by first name', () => {
    renderHome();
    expect(screen.getByText(/Hola Ana/i)).toBeInTheDocument();
  });

  it('shows Areas section as an active link with the current count', () => {
    renderHome();
    const link = screen.getByRole('link', { name: /Ir a Areas/i });
    expect(link).toHaveAttribute('href', '/admin/areas');
    // Area count (2) is rendered alongside the card
    expect(link).toHaveTextContent('2');
  });

  it('renders disabled cards for entities without backend edit support', () => {
    renderHome();
    // These should NOT be rendered as links since the endpoints do not exist
    expect(screen.queryByRole('link', { name: /Ir a Asignaturas/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ir a Cursos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ir a Temas/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ir a Actividades/i })).not.toBeInTheDocument();
    // But they should still appear as headings
    expect(screen.getByRole('heading', { name: 'Asignaturas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cursos' })).toBeInTheDocument();
  });
});
