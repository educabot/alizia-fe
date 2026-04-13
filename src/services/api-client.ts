import { env } from '@/config/env';
import type { APIErrorBody, PaginatedResponse } from '@/types';

// =============================================================================
// Error classes
// =============================================================================

export class APIError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly status?: number;

  constructor(code: string, message: string, details?: Record<string, unknown>, status?: number) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export class AuthError extends APIError {
  constructor(code: string, message: string) {
    super(code, message, undefined, 401);
    this.name = 'AuthError';
  }
}

// =============================================================================
// Token management (sessionStorage — sobrevive al F5, muere al cerrar pestaña)
// RFC §4.1 prohibe localStorage; sessionStorage cumple "no persistido a disco".
// =============================================================================

const TOKEN_STORAGE_KEY = 'alizia_auth_token';

function readStoredToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    else sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Quota / privacy mode — silently fall back to in-memory only
  }
}

let authToken: string | null = readStoredToken();

export function setAuthToken(token: string | null) {
  authToken = token;
  writeStoredToken(token);
}

export function getAuthToken(): string | null {
  return authToken;
}

// =============================================================================
// Logout callback (set by auth store to avoid circular imports)
// =============================================================================

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

// =============================================================================
// Core request function
// =============================================================================

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const extraHeaders = options?.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : Array.isArray(options?.headers)
      ? Object.fromEntries(options.headers)
      : (options?.headers as Record<string, string> | undefined) ?? {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${env.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 204 No Content — callers using delete/void endpoints should type T as void
  if (res.status === 204) return undefined as unknown as T;

  // Error handling
  if (!res.ok) {
    let errorBody: APIErrorBody | null = null;
    try {
      errorBody = await res.json();
    } catch {
      throw new APIError('NETWORK_ERROR', `Error de red: ${res.status} ${res.statusText}`, undefined, res.status);
    }

    const code = errorBody?.error?.code ?? 'UNKNOWN_ERROR';
    const message = errorBody?.error?.message ?? 'Error desconocido';
    const details = errorBody?.error?.details;

    if (res.status === 401) {
      onUnauthorized?.();
      throw new AuthError(code, message);
    }

    throw new APIError(code, message, details, res.status);
  }

  return res.json();
}

// =============================================================================
// HTTP method helpers
// =============================================================================

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

// =============================================================================
// Pagination helper
// =============================================================================

export async function fetchPaginated<T>(endpoint: string, limit = 20, offset = 0): Promise<PaginatedResponse<T>> {
  const separator = endpoint.includes('?') ? '&' : '?';
  return apiClient.get<PaginatedResponse<T>>(`${endpoint}${separator}limit=${limit}&offset=${offset}`);
}
