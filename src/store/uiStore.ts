import { create } from 'zustand';

/**
 * UI store (RFC §3.3 / audit gap G-3.2).
 *
 * Estado global de UI que no pertenece a ningun slice de dominio. Hoy el unico
 * consumidor real es el toggle del sidebar, pero este store existe como punto
 * de extension para futuros estados transversales (modales globales, drawers,
 * secciones expandidas).
 *
 * Persistencia: localStorage (preferencia de usuario que sobrevive al logout,
 * a diferencia del sessionStorage que usa authStore).
 */

const SIDEBAR_STORAGE_KEY = 'alizia_ui_sidebar_open';

function readStoredSidebarOpen(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

function writeStoredSidebarOpen(open: boolean) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  } catch {
    // Quota / privacy mode — fall back to in-memory only
  }
}

interface UiState {
  sidebarOpen: boolean;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: readStoredSidebarOpen(),

  setSidebarOpen: (open) => {
    writeStoredSidebarOpen(open);
    set({ sidebarOpen: open });
  },
  toggleSidebar: () => {
    const next = !get().sidebarOpen;
    writeStoredSidebarOpen(next);
    set({ sidebarOpen: next });
  },
}));
