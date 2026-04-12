import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useConfigStore } from '@/store/configStore';
import { Sidebar } from './Sidebar';
import type { User } from '@/types';

const teacherUser: User = {
  id: 1,
  name: 'Teacher',
  email: 't@t.com',
  avatar: '',
  roles: ['teacher'],
};

const coordinatorUser: User = {
  id: 2,
  name: 'Coord',
  email: 'c@t.com',
  avatar: '',
  roles: ['coordinator'],
};

const multiRoleUser: User = {
  id: 3,
  name: 'Multi',
  email: 'm@t.com',
  avatar: '',
  roles: ['teacher', 'coordinator'],
};

const adminUser: User = {
  id: 4,
  name: 'Admin',
  email: 'a@t.com',
  avatar: '',
  roles: ['admin'],
};

function renderSidebar(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
    // Default config: modules contenido + planificacion enabled
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
  });

  it('shows only Inicio when user is logged out', () => {
    renderSidebar();
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.queryByLabelText('Recursos')).not.toBeInTheDocument();
  });

  it('shows Inicio + Recursos for a teacher with contenido module enabled', () => {
    useAuthStore.setState({ user: teacherUser });
    renderSidebar();
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Recursos')).toBeInTheDocument();
  });

  it('hides Recursos for a coordinator-only user (role gate)', () => {
    useAuthStore.setState({ user: coordinatorUser });
    renderSidebar();
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.queryByLabelText('Recursos')).not.toBeInTheDocument();
  });

  it('shows Recursos for a multi-role user (teacher + coordinator) — RFC §4.2', () => {
    useAuthStore.setState({ user: multiRoleUser });
    renderSidebar();
    // Regression test for G-4.2: old code used primary role (coordinator) and
    // hid teacher-only items from multi-role users.
    expect(screen.getByLabelText('Recursos')).toBeInTheDocument();
  });

  it('hides Recursos when the contenido module is disabled', () => {
    useAuthStore.setState({ user: teacherUser });
    useConfigStore.setState({
      orgConfig: {
        topic_max_levels: 3,
        topic_level_names: [],
        topic_selection_level: 3,
        shared_classes_enabled: true,
        desarrollo_max_activities: 3,
        coord_doc_sections: [],
        modules: { contenido: false, planificacion: true },
      },
    });
    renderSidebar();
    expect(screen.queryByLabelText('Recursos')).not.toBeInTheDocument();
  });

  it('all rendered links point to real routes (no `to="/"` duplicates)', () => {
    useAuthStore.setState({ user: teacherUser });
    const { container } = renderSidebar();
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    // Regression test for G-5.4: old sidebar had 4 of 5 items pointing to `/`.
    expect(hrefs).toEqual(['/', '/resources']);
    expect(new Set(hrefs).size).toBe(hrefs.length); // sin duplicados
  });

  it('shows the coordinator documents link for coordinators (G-5.1)', () => {
    useAuthStore.setState({ user: coordinatorUser });
    const { container } = renderSidebar();
    // Default nomenclature pluraliza como "Documentos de coordinacion"
    expect(screen.getByLabelText('Documentos de coordinacion')).toBeInTheDocument();
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/coordinator/documents');
  });

  it('hides the coordinator documents link for teachers', () => {
    useAuthStore.setState({ user: teacherUser });
    renderSidebar();
    expect(screen.queryByLabelText('Documentos de coordinacion')).not.toBeInTheDocument();
  });

  it('shows the Areas link for admin users (admin CRUD)', () => {
    useAuthStore.setState({ user: adminUser });
    const { container } = renderSidebar();
    expect(screen.getByLabelText('Areas')).toBeInTheDocument();
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/admin/areas');
  });

  it('hides the admin Areas link for non-admin users', () => {
    useAuthStore.setState({ user: teacherUser });
    renderSidebar();
    expect(screen.queryByLabelText('Areas')).not.toBeInTheDocument();
  });

  it('marks the active item based on current pathname', () => {
    useAuthStore.setState({ user: teacherUser });
    renderSidebar('/resources');
    const recursos = screen.getByLabelText('Recursos');
    expect(recursos.className).toContain('text-primary');
  });
});
