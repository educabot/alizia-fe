import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from './NotFound';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('NotFound page (G-5.3)', () => {
  it('renders heading and helper text', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Pagina no encontrada/i })).toBeInTheDocument();
    expect(screen.getByText(/no existe o fue movida/i)).toBeInTheDocument();
  });

  it('navigates back when clicking "Volver atras"', async () => {
    const user = userEvent.setup();
    navigateMock.mockClear();
    render(
      <MemoryRouter>
        <NotFound />
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
        <NotFound />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /Ir al inicio/i }));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
