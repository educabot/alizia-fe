import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

// =============================================================================
// Mocks
// =============================================================================

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
  onboardingApi: {
    getStatus: vi.fn(),
  },
}));

// =============================================================================
// Helpers
// =============================================================================

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const mockUser: User = {
  id: 1,
  name: 'Test',
  email: 'test@test.com',
  avatar: '',
  roles: ['teacher'],
};

// =============================================================================
// Tests
// =============================================================================

describe('useAuth', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuthStore.setState({ user: null, isLoading: false, error: null });
    navigateMock.mockReset();
    vi.clearAllMocks();
  });

  it('exposes the current user and auth state', () => {
    useAuthStore.setState({ user: mockUser });
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('teacher');
  });

  it('returns isAuthenticated=false when no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
  });

  describe('login redirect (G-6.1)', () => {
    it('redirects to /onboarding when onboarding is not completed', async () => {
      const { authApi, onboardingApi } = await import('@/services/api');
      vi.mocked(authApi.login).mockResolvedValueOnce({ token: 'jwt', user: mockUser });
      vi.mocked(onboardingApi.getStatus).mockResolvedValueOnce({ completed: false });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await act(async () => {
        await result.current.login('test@test.com', 'pass');
      });

      expect(onboardingApi.getStatus).toHaveBeenCalledOnce();
      expect(navigateMock).toHaveBeenCalledWith('/onboarding');
    });

    it('redirects to / when onboarding is completed', async () => {
      const { authApi, onboardingApi } = await import('@/services/api');
      vi.mocked(authApi.login).mockResolvedValueOnce({ token: 'jwt', user: mockUser });
      vi.mocked(onboardingApi.getStatus).mockResolvedValueOnce({
        completed: true,
        completed_at: '2026-04-10T00:00:00Z',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await act(async () => {
        await result.current.login('test@test.com', 'pass');
      });

      expect(navigateMock).toHaveBeenCalledWith('/');
    });

    it('falls back to / when onboarding status endpoint fails', async () => {
      const { authApi, onboardingApi } = await import('@/services/api');
      vi.mocked(authApi.login).mockResolvedValueOnce({ token: 'jwt', user: mockUser });
      vi.mocked(onboardingApi.getStatus).mockRejectedValueOnce(new Error('network'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await act(async () => {
        await result.current.login('test@test.com', 'pass');
      });

      expect(navigateMock).toHaveBeenCalledWith('/');
    });

    it('does NOT navigate when login fails (invalid credentials)', async () => {
      const { authApi, onboardingApi } = await import('@/services/api');
      vi.mocked(authApi.login).mockRejectedValueOnce(new Error('bad creds'));
      // With no dev mock for 'bad@t.com', login leaves user null

      const { result } = renderHook(() => useAuth(), { wrapper });
      await act(async () => {
        await result.current.login('bad@t.com', 'wrong');
      });

      expect(navigateMock).not.toHaveBeenCalled();
      expect(onboardingApi.getStatus).not.toHaveBeenCalled();
      expect(useAuthStore.getState().error).not.toBeNull();
    });
  });

  describe('logout', () => {
    it('clears user and navigates to /login', () => {
      useAuthStore.setState({ user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper });
      act(() => {
        result.current.logout();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });
});
