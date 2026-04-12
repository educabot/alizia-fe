import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';
import { useUiStore } from '@/store/uiStore';
import { MainLayout } from './MainLayout';
import type { User } from '@/types';

const teacherUser: User = {
  id: 1,
  name: 'Teacher',
  email: 't@t.com',
  avatar: '',
  roles: ['teacher'],
};

function renderLayout() {
  return render(
    <MemoryRouter>
      <MainLayout>
        <div data-testid='layout-child'>main content</div>
      </MainLayout>
    </MemoryRouter>,
  );
}

describe('MainLayout', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: teacherUser });
    useConfigStore.setState({
      orgConfig: {
        topic_max_levels: 3,
        topic_level_names: [],
        topic_selection_level: 3,
        shared_classes_enabled: true,
        desarrollo_max_activities: 3,
        coord_doc_sections: [],
        modules: { contenido: true, planificacion: true },
      },
    });
    useUiStore.setState({ sidebarOpen: true });
  });

  it('renders the sidebar when sidebarOpen is true', () => {
    renderLayout();
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.getByTestId('layout-child')).toBeInTheDocument();
  });

  it('hides the sidebar when sidebarOpen is false but keeps main content', () => {
    useUiStore.setState({ sidebarOpen: false });
    renderLayout();
    expect(screen.queryByLabelText('Inicio')).not.toBeInTheDocument();
    expect(screen.getByTestId('layout-child')).toBeInTheDocument();
  });
});
