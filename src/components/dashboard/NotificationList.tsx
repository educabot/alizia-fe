import { Bell, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import type { Notification, NotificationType } from '@/types';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead?: (id: number) => void;
}

const ICON_MAP: Record<NotificationType, typeof Bell> = {
  publication: FileText,
  update: RefreshCw,
  deadline: AlertCircle,
};

export function NotificationList({ notifications, onMarkAsRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className='text-center py-6'>
        <Bell className='w-8 h-8 text-gray-300 mx-auto mb-2' />
        <p className='text-sm text-gray-400'>Sin notificaciones</p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {notifications.map((n) => {
        const Icon = ICON_MAP[n.type] || Bell;
        return (
          <div
            key={n.id}
            onClick={() => !n.read && onMarkAsRead?.(n.id)}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
              n.read ? 'bg-white text-gray-500' : 'bg-primary/5 text-gray-900 cursor-pointer hover:bg-primary/10'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${n.read ? 'bg-gray-100' : 'bg-primary/10 text-primary'}`}>
              <Icon className='w-4 h-4' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h4 className={`text-sm font-medium truncate ${n.read ? 'text-gray-500' : 'text-gray-900'}`}>
                  {n.title}
                </h4>
                {!n.read && <span className='w-2 h-2 rounded-full bg-primary shrink-0' />}
              </div>
              <p className='text-xs text-gray-500 mt-0.5 line-clamp-2'>{n.message}</p>
              <p className='text-xs text-gray-400 mt-1'>
                {new Date(n.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
