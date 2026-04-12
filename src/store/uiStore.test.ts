import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUiStore } from './uiStore';

const STORAGE_KEY = 'alizia_ui_sidebar_open';

describe('uiStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Default sidebarOpen: true — reset before each test so previous runs
    // do not leak into the next one.
    useUiStore.setState({ sidebarOpen: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to sidebarOpen = true', () => {
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  describe('setSidebarOpen', () => {
    it('writes the new value to state and localStorage', () => {
      useUiStore.getState().setSidebarOpen(false);
      expect(useUiStore.getState().sidebarOpen).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false');

      useUiStore.getState().setSidebarOpen(true);
      expect(useUiStore.getState().sidebarOpen).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('swallows localStorage errors (quota / privacy mode)', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });

      expect(() => useUiStore.getState().setSidebarOpen(false)).not.toThrow();
      // State still updates in memory even if persistence fails
      expect(useUiStore.getState().sidebarOpen).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('toggleSidebar', () => {
    it('flips the value and persists it', () => {
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarOpen).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false');

      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarOpen).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('reads the next value from the current state, not a stale closure', () => {
      useUiStore.setState({ sidebarOpen: false });
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('persistence', () => {
    it('writes "true"/"false" strings (not JSON) so the format is stable', () => {
      useUiStore.getState().setSidebarOpen(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
      useUiStore.getState().setSidebarOpen(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('re-imports the store module and hydrates from a pre-seeded value', async () => {
      localStorage.setItem(STORAGE_KEY, 'false');
      vi.resetModules();
      const mod = await import('./uiStore');
      expect(mod.useUiStore.getState().sidebarOpen).toBe(false);
    });

    it('defaults to true when the stored value is missing', async () => {
      localStorage.removeItem(STORAGE_KEY);
      vi.resetModules();
      const mod = await import('./uiStore');
      expect(mod.useUiStore.getState().sidebarOpen).toBe(true);
    });

    it('treats any non-"true" string as false on hydration', async () => {
      localStorage.setItem(STORAGE_KEY, 'garbage');
      vi.resetModules();
      const mod = await import('./uiStore');
      expect(mod.useUiStore.getState().sidebarOpen).toBe(false);
    });

    it('falls back to true when localStorage.getItem throws on hydration', async () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      vi.resetModules();
      const mod = await import('./uiStore');
      expect(mod.useUiStore.getState().sidebarOpen).toBe(true);
      spy.mockRestore();
    });
  });
});
