import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import * as apiClient from '@/services/api-client';

// Mock the api module (authApi is called by login; onboardingApi is not used here)
vi.mock('@/services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Fresh session + clean in-memory token between tests
    sessionStorage.clear();
    apiClient.setAuthToken(null);
    useAuthStore.setState({ user: null, isLoading: false, error: null });
    vi.clearAllMocks();
  });

  it('starts with no user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('login', () => {
    it('sets user and persists to sessionStorage on successful login', async () => {
      const { authApi } = await import('@/services/api');
      const mockUser = {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        avatar: '',
        roles: ['teacher' as const],
      };
      vi.mocked(authApi.login).mockResolvedValueOnce({ token: 'jwt-123', user: mockUser });

      await useAuthStore.getState().login('test@test.com', 'pass123');

      expect(apiClient.getAuthToken()).toBe('jwt-123');
      expect(sessionStorage.getItem('alizia_auth_token')).toBe('jwt-123');
      expect(sessionStorage.getItem('alizia_auth_user')).toBe(JSON.stringify(mockUser));
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('sets error when login fails and email is not a dev mock user', async () => {
      const { authApi } = await import('@/services/api');
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Credenciales invalidas'));

      // In dev mode, mock fallback kicks in — email not in MOCK_USERS so error is set
      await useAuthStore.getState().login('bad@test.com', 'wrong');

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBe('Error al iniciar sesion. Verifica tus credenciales.');
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(sessionStorage.getItem('alizia_auth_token')).toBeNull();
      expect(sessionStorage.getItem('alizia_auth_user')).toBeNull();
    });

    it('uses mock fallback in dev for known mock users when backend fails', async () => {
      const { authApi } = await import('@/services/api');
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error('network'));

      await useAuthStore.getState().login('coord@neuquen.edu.ar', 'anything');

      const user = useAuthStore.getState().user;
      expect(user).not.toBeNull();
      expect(user?.email).toBe('coord@neuquen.edu.ar');
      expect(apiClient.getAuthToken()).toBe('mock-token');
      expect(sessionStorage.getItem('alizia_auth_user')).toContain('Carlos Coordinador');
    });
  });

  describe('logout', () => {
    it('clears user, token and sessionStorage', () => {
      useAuthStore.setState({
        user: { id: 1, name: 'Test', email: 'test@test.com', avatar: '', roles: ['teacher'] },
      });
      apiClient.setAuthToken('jwt-xyz');
      sessionStorage.setItem('alizia_auth_user', JSON.stringify({ id: 1 }));

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(apiClient.getAuthToken()).toBeNull();
      expect(sessionStorage.getItem('alizia_auth_token')).toBeNull();
      expect(sessionStorage.getItem('alizia_auth_user')).toBeNull();
    });
  });

  describe('hydrate', () => {
    it('restores user from sessionStorage when both token and user are present', () => {
      const storedUser = {
        id: 9,
        name: 'Hydrated',
        email: 'h@t.com',
        avatar: '',
        roles: ['coordinator' as const],
      };
      apiClient.setAuthToken('jwt-hydrated');
      sessionStorage.setItem('alizia_auth_user', JSON.stringify(storedUser));

      useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().user).toEqual(storedUser);
    });

    it('clears partial state when token exists but user does not', () => {
      apiClient.setAuthToken('jwt-orphan');
      // No user in sessionStorage

      useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().user).toBeNull();
      expect(apiClient.getAuthToken()).toBeNull();
      expect(sessionStorage.getItem('alizia_auth_token')).toBeNull();
    });

    it('clears partial state when user exists but token does not', () => {
      sessionStorage.setItem(
        'alizia_auth_user',
        JSON.stringify({ id: 1, name: 'X', email: 'x@x.com', avatar: '', roles: ['teacher'] }),
      );

      useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().user).toBeNull();
      expect(sessionStorage.getItem('alizia_auth_user')).toBeNull();
    });

    it('stays logged out when sessionStorage is empty', () => {
      useAuthStore.getState().hydrate();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('handles corrupted JSON in stored user gracefully', () => {
      apiClient.setAuthToken('jwt-1');
      sessionStorage.setItem('alizia_auth_user', '{not valid json');

      useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().user).toBeNull();
      expect(apiClient.getAuthToken()).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('returns null when no user', () => {
      expect(useAuthStore.getState().getUserRole()).toBeNull();
    });

    it('returns coordinator role', () => {
      useAuthStore.setState({
        user: { id: 1, name: 'Coord', email: 'c@t.com', avatar: '', roles: ['coordinator'] },
      });
      expect(useAuthStore.getState().getUserRole()).toBe('coordinator');
    });

    it('returns teacher role', () => {
      useAuthStore.setState({
        user: { id: 2, name: 'Teacher', email: 't@t.com', avatar: '', roles: ['teacher'] },
      });
      expect(useAuthStore.getState().getUserRole()).toBe('teacher');
    });

    it('prioritizes coordinator over teacher', () => {
      useAuthStore.setState({
        user: { id: 3, name: 'Multi', email: 'm@t.com', avatar: '', roles: ['teacher', 'coordinator'] },
      });
      expect(useAuthStore.getState().getUserRole()).toBe('coordinator');
    });
  });

  describe('hasRole', () => {
    it('returns false when no user', () => {
      expect(useAuthStore.getState().hasRole('teacher')).toBe(false);
    });

    it('returns true when user has the role', () => {
      useAuthStore.setState({
        user: { id: 1, name: 'T', email: 't@t.com', avatar: '', roles: ['teacher'] },
      });
      expect(useAuthStore.getState().hasRole('teacher')).toBe(true);
    });

    it('returns false when user lacks the role', () => {
      useAuthStore.setState({
        user: { id: 1, name: 'T', email: 't@t.com', avatar: '', roles: ['teacher'] },
      });
      expect(useAuthStore.getState().hasRole('coordinator')).toBe(false);
    });

    it('supports multi-role check', () => {
      useAuthStore.setState({
        user: { id: 3, name: 'Multi', email: 'm@t.com', avatar: '', roles: ['teacher', 'coordinator'] },
      });
      expect(useAuthStore.getState().hasRole('teacher')).toBe(true);
      expect(useAuthStore.getState().hasRole('coordinator')).toBe(true);
      expect(useAuthStore.getState().hasRole('admin')).toBe(false);
      expect(useAuthStore.getState().hasRole('teacher', 'admin')).toBe(true);
    });
  });
});
