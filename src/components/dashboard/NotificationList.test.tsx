import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationList } from './NotificationList';
import type { Notification } from '@/types';

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 2,
    type: 'publication',
    title: 'Documento publicado',
    message: 'Coordinador publico un documento.',
    read: false,
    created_at: '2026-04-08T10:00:00Z',
  },
  {
    id: 2,
    user_id: 2,
    type: 'deadline',
    title: 'Plazo proximo',
    message: 'Completa tus planes antes del viernes.',
    read: true,
    created_at: '2026-04-07T14:30:00Z',
  },
];

describe('NotificationList', () => {
  it('renders notifications with titles', () => {
    render(<NotificationList notifications={NOTIFICATIONS} />);

    expect(screen.getByText('Documento publicado')).toBeInTheDocument();
    expect(screen.getByText('Plazo proximo')).toBeInTheDocument();
  });

  it('renders notification messages', () => {
    render(<NotificationList notifications={NOTIFICATIONS} />);

    expect(screen.getByText(/Coordinador publico/)).toBeInTheDocument();
    expect(screen.getByText(/Completa tus planes/)).toBeInTheDocument();
  });

  it('shows unread indicator for unread notifications', () => {
    const { container } = render(<NotificationList notifications={NOTIFICATIONS} />);

    // Unread notification has a blue dot (w-2 h-2 rounded-full bg-primary)
    const dots = container.querySelectorAll('.bg-primary.rounded-full');
    expect(dots.length).toBe(1); // Only first notification is unread
  });

  it('calls onMarkAsRead when clicking unread notification', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn();

    render(<NotificationList notifications={NOTIFICATIONS} onMarkAsRead={onMarkAsRead} />);

    await user.click(screen.getByText('Documento publicado'));
    expect(onMarkAsRead).toHaveBeenCalledWith(1);
  });

  it('does not call onMarkAsRead for already-read notifications', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn();

    render(<NotificationList notifications={NOTIFICATIONS} onMarkAsRead={onMarkAsRead} />);

    await user.click(screen.getByText('Plazo proximo'));
    expect(onMarkAsRead).not.toHaveBeenCalled();
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationList notifications={[]} />);

    expect(screen.getByText('Sin notificaciones')).toBeInTheDocument();
  });
});
