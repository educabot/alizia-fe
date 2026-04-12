import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Login } from './Login';

// Mock AnimatedOrb since it's a visual-only component
vi.mock('@/components/ui/AnimatedOrb', () => ({
  AnimatedOrb: () => <div data-testid='animated-orb' />,
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login page', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: false, error: null });
  });

  it('renders email and password fields', () => {
    renderLogin();

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contrasena')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  it('disables submit when fields are empty', () => {
    renderLogin();

    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeDisabled();
  });

  it('enables submit when fields are filled', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Email'), 'test@test.com');
    await user.type(screen.getByLabelText('Contrasena'), 'password123');

    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeEnabled();
  });

  it('displays error message from store', () => {
    useAuthStore.setState({ error: 'Credenciales invalidas' });
    renderLogin();

    expect(screen.getByText('Credenciales invalidas')).toBeInTheDocument();
  });

  it('shows loading state during login', () => {
    useAuthStore.setState({ isLoading: true });
    renderLogin();

    expect(screen.getByText(/iniciando sesion/i)).toBeInTheDocument();
  });
});
