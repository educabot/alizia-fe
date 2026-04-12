import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useConfigStore } from '@/store/configStore';
import { RequireModule } from './RequireModule';

function renderWithRouter(ui: React.ReactElement, initialRoute = '/test') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path='/' element={<div>Home Page</div>} />
        <Route path='/test' element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireModule', () => {
  beforeEach(() => {
    useConfigStore.getState().reset();
  });

  it('renders children when module is enabled', () => {
    useConfigStore.getState().setOrgConfig({
      ...useConfigStore.getState().orgConfig,
      modules: { contenido: true },
    });

    renderWithRouter(
      <RequireModule module='contenido'>
        <div>Resource Content</div>
      </RequireModule>,
    );

    expect(screen.getByText('Resource Content')).toBeInTheDocument();
  });

  it('renders children when module is not set (defaults to enabled)', () => {
    renderWithRouter(
      <RequireModule module='contenido'>
        <div>Resource Content</div>
      </RequireModule>,
    );

    expect(screen.getByText('Resource Content')).toBeInTheDocument();
  });

  it('redirects to / when module is disabled', () => {
    useConfigStore.getState().setOrgConfig({
      ...useConfigStore.getState().orgConfig,
      modules: { contenido: false },
    });

    renderWithRouter(
      <RequireModule module='contenido'>
        <div>Resource Content</div>
      </RequireModule>,
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Resource Content')).not.toBeInTheDocument();
  });
});
