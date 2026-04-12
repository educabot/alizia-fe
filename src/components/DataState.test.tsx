import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataState } from './DataState';
import { APIError } from '@/services/api-client';

describe('DataState', () => {
  it('renders children when data is present', () => {
    render(
      <DataState loading={false} error={null} data={[1, 2]}>
        <div>ok</div>
      </DataState>,
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('shows the loading indicator', () => {
    render(
      <DataState loading error={null} data={null}>
        <div>ok</div>
      </DataState>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('ok')).not.toBeInTheDocument();
  });

  it('shows the error state with the friendly mapped message', () => {
    const err = new APIError('NOT_FOUND', 'User not found', undefined, 404);
    render(
      <DataState loading={false} error={err} data={null}>
        <div>ok</div>
      </DataState>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/No encontramos lo que buscas/i)).toBeInTheDocument();
    expect(screen.queryByText('ok')).not.toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <DataState loading={false} error={new Error('boom')} data={null} onRetry={onRetry}>
        <div>ok</div>
      </DataState>,
    );
    await user.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the empty state for null/empty arrays', () => {
    render(
      <DataState loading={false} error={null} data={[]} emptyMessage='Nada por aqui'>
        <div>ok</div>
      </DataState>,
    );
    expect(screen.getByText('Nada por aqui')).toBeInTheDocument();
    expect(screen.queryByText('ok')).not.toBeInTheDocument();
  });

  it('renders custom emptyState slot when provided', () => {
    render(
      <DataState loading={false} error={null} data={null} emptyState={<div>custom empty</div>}>
        <div>ok</div>
      </DataState>,
    );
    expect(screen.getByText('custom empty')).toBeInTheDocument();
  });
});
