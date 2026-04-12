import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Forbidden } from '@/pages/Forbidden';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, user must have one of these roles */
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (roles && roles.length > 0) {
    if (!hasRole(...roles)) {
      // Mostramos 403 en vez de redirect silencioso — el usuario necesita feedback.
      return <Forbidden />;
    }
  }

  return <>{children}</>;
}
