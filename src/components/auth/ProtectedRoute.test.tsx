import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from './ProtectedRoute';

function renderWithRouter(ui: React.ReactElement, initialRoute = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path='/login' element={<div>Login Page</div>} />
        <Route path='/' element={<div>Home Page</div>} />
        <Route path='/protected' element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false, error: null });
  });

  it('redirects to /login when not authenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({
      user: { id: 1, name: 'Test', email: 't@t.com', avatar: '', roles: ['teacher'] },
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('shows Forbidden page when user lacks required role (G-5.3)', () => {
    useAuthStore.setState({
      user: { id: 1, name: 'Teacher', email: 't@t.com', avatar: '', roles: ['teacher'] },
    });

    renderWithRouter(
      <ProtectedRoute roles={['coordinator']}>
        <div>Coordinator Only</div>
      </ProtectedRoute>,
    );

    // Ya no redirecciona silenciosamente — muestra 403 con feedback al usuario.
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Coordinator Only')).not.toBeInTheDocument();
  });

  it('renders when user has required role', () => {
    useAuthStore.setState({
      user: { id: 1, name: 'Coord', email: 'c@t.com', avatar: '', roles: ['coordinator'] },
    });

    renderWithRouter(
      <ProtectedRoute roles={['coordinator']}>
        <div>Coordinator Only</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Coordinator Only')).toBeInTheDocument();
  });

  it('allows multi-role user to access coordinator route', () => {
    useAuthStore.setState({
      user: { id: 4, name: 'Multi', email: 'm@t.com', avatar: '', roles: ['teacher', 'coordinator'] },
    });

    renderWithRouter(
      <ProtectedRoute roles={['coordinator']}>
        <div>Coordinator Only</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Coordinator Only')).toBeInTheDocument();
  });

  it('allows multi-role user to access teacher route', () => {
    useAuthStore.setState({
      user: { id: 4, name: 'Multi', email: 'm@t.com', avatar: '', roles: ['teacher', 'coordinator'] },
    });

    renderWithRouter(
      <ProtectedRoute roles={['teacher']}>
        <div>Teacher Only</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Teacher Only')).toBeInTheDocument();
  });
});
