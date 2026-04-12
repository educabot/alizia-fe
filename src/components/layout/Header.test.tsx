import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Header } from './Header';
import type { User } from '@/types';

const teacherUser: User = {
  id: 1,
  name: 'Teacher',
  email: 't@t.com',
  avatar: '',
  roles: ['teacher'],
};

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
    useUiStore.setState({ sidebarOpen: true });
    localStorage.clear();
  });

  it('hides the sidebar toggle when the user is logged out', () => {
    renderHeader();
    expect(screen.queryByLabelText(/menu lateral/i)).not.toBeInTheDocument();
  });

  it('renders the sidebar toggle with the open label when sidebarOpen is true', () => {
    useAuthStore.setState({ user: teacherUser });
    renderHeader();
    const btn = screen.getByLabelText('Ocultar menu lateral');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the sidebar toggle with the closed label when sidebarOpen is false', () => {
    useAuthStore.setState({ user: teacherUser });
    useUiStore.setState({ sidebarOpen: false });
    renderHeader();
    const btn = screen.getByLabelText('Mostrar menu lateral');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles the store when the button is clicked', async () => {
    useAuthStore.setState({ user: teacherUser });
    renderHeader();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Ocultar menu lateral'));
    expect(useUiStore.getState().sidebarOpen).toBe(false);

    await user.click(screen.getByLabelText('Mostrar menu lateral'));
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });
});
