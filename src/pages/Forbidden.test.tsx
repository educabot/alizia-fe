import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Forbidden } from './Forbidden';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Forbidden page (G-5.3)', () => {
  it('renders heading and helper text', () => {
    render(
      <MemoryRouter>
        <Forbidden />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Acceso denegado/i })).toBeInTheDocument();
    expect(screen.getByText(/No tenes permisos/i)).toBeInTheDocument();
  });

  it('navigates back when clicking "Volver atras"', async () => {
    const user = userEvent.setup();
    navigateMock.mockClear();
    render(
      <MemoryRouter>
        <Forbidden />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /Volver atras/i }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('navigates to / when clicking "Ir al inicio"', async () => {
    const user = userEvent.setup();
    navigateMock.mockClear();
    render(
      <MemoryRouter>
        <Forbidden />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /Ir al inicio/i }));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
