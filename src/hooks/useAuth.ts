import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { onboardingApi } from '@/services/api';

/**
 * Convenience hook over useAuthStore.
 * Adds navigation:
 *  - Después de login, chequea `onboardingApi.getStatus()`:
 *    - `completed: false` → redirect a `/onboarding`
 *    - `completed: true`  → redirect a `/`
 *    - Si el endpoint falla (dev sin backend), default a `/`.
 *  - Después de logout, redirect a `/login`.
 */
export function useAuth() {
  const { user, isLoading, error, getUserRole } = useAuthStore();
  const login = useAuthStore((s) => s.login);
  const logoutStore = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
      // authStore.login captura errores internos — verificamos éxito por state.
      const postLoginUser = useAuthStore.getState().user;
      if (!postLoginUser) return;

      try {
        const status = await onboardingApi.getStatus();
        navigate(status.completed ? '/' : '/onboarding');
      } catch {
        if (import.meta.env.DEV) {
          console.warn('[Alizia] Onboarding status unavailable — defaulting to /');
        }
        navigate('/');
      }
    },
    [login, navigate],
  );

  const handleLogout = useCallback(() => {
    logoutStore();
    navigate('/login');
  }, [logoutStore, navigate]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    role: getUserRole(),
    login: handleLogin,
    logout: handleLogout,
  };
}
