import { create } from 'zustand';
import { authApi } from '@/services/api';
import { setAuthToken, getAuthToken, setOnUnauthorized } from '@/services/api-client';
import type { User, UserRole } from '@/types';

/** Mock users for local dev without backend */
const MOCK_USERS: Record<string, User> = {
  'coord@neuquen.edu.ar': {
    id: 2,
    name: 'Carlos Coordinador',
    email: 'coord@neuquen.edu.ar',
    avatar: '',
    roles: ['coordinator'],
  },
  'teacher1@neuquen.edu.ar': {
    id: 3,
    name: 'María Docente',
    email: 'teacher1@neuquen.edu.ar',
    avatar: '',
    roles: ['teacher'],
  },
  'teacher2@neuquen.edu.ar': {
    id: 4,
    name: 'Pedro Multirol',
    email: 'teacher2@neuquen.edu.ar',
    avatar: '',
    roles: ['teacher', 'coordinator'],
  },
  'admin@neuquen.edu.ar': { id: 1, name: 'Ana Admin', email: 'admin@neuquen.edu.ar', avatar: '', roles: ['admin'] },
};

// =============================================================================
// Session persistence (RFC §4.1 — sessionStorage, no localStorage)
// =============================================================================

const USER_STORAGE_KEY = 'alizia_auth_user';

function readStoredUser(): User | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (user) sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Quota / privacy mode — silently fall back to in-memory only
  }
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /**
   * Restaura la sesión desde sessionStorage si hay token + user válidos.
   * Limpia el storage si el par está incompleto.
   */
  hydrate: () => void;
  /** Returns the primary role for UI routing (coordinator > teacher > admin) */
  getUserRole: () => UserRole | null;
  /** Returns true if user has ANY of the given roles */
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.login({ email, password });
      setAuthToken(token);
      writeStoredUser(user);
      set({ user, isLoading: false });
    } catch {
      // Mock login only in dev mode — Vite tree-shakes this out of production builds
      if (import.meta.env.DEV) {
        const mockUser = MOCK_USERS[email];
        if (mockUser) {
          console.warn('[Alizia] Backend unavailable — using mock login for', email);
          setAuthToken('mock-token');
          writeStoredUser(mockUser);
          set({ user: mockUser, isLoading: false });
          return;
        }
      }
      set({ error: 'Error al iniciar sesion. Verifica tus credenciales.', isLoading: false });
    }
  },

  logout: () => {
    setAuthToken(null);
    writeStoredUser(null);
    set({ user: null, error: null });
  },

  hydrate: () => {
    const storedUser = readStoredUser();
    const storedToken = getAuthToken();
    if (storedUser && storedToken) {
      set({ user: storedUser });
    } else {
      // Estado parcial (solo token o solo user) → limpiamos todo
      setAuthToken(null);
      writeStoredUser(null);
      set({ user: null });
    }
  },

  getUserRole: () => {
    const { user } = get();
    if (!user) return null;
    if (user.roles?.includes('coordinator')) return 'coordinator';
    if (user.roles?.includes('teacher')) return 'teacher';
    if (user.roles?.includes('admin')) return 'admin';
    return null;
  },

  hasRole: (...roles) => {
    const { user } = get();
    if (!user?.roles) return false;
    return user.roles.some((r) => roles.includes(r));
  },
}));

// Rehidratación automática al cargar el módulo (sobrevive al F5)
useAuthStore.getState().hydrate();

// Wire up 401 handler — when the API returns 401, auto-logout
setOnUnauthorized(() => {
  useAuthStore.getState().logout();
});
