import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, APIError, AuthError, setAuthToken, getAuthToken, setOnUnauthorized } from './api-client';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock env
vi.mock('@/config/env', () => ({
  env: { API_BASE_URL: 'http://test-api' },
}));

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api-client', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setAuthToken(null);
    mockFetch.mockReset();
  });

  afterEach(() => {
    setAuthToken(null);
    sessionStorage.clear();
  });

  describe('token management', () => {
    it('stores and retrieves token', () => {
      expect(getAuthToken()).toBeNull();
      setAuthToken('abc123');
      expect(getAuthToken()).toBe('abc123');
    });

    it('clears token with null', () => {
      setAuthToken('abc123');
      setAuthToken(null);
      expect(getAuthToken()).toBeNull();
    });

    it('persists the token to sessionStorage', () => {
      setAuthToken('persisted-jwt');
      expect(sessionStorage.getItem('alizia_auth_token')).toBe('persisted-jwt');
    });

    it('removes the token from sessionStorage when cleared', () => {
      setAuthToken('persisted-jwt');
      setAuthToken(null);
      expect(sessionStorage.getItem('alizia_auth_token')).toBeNull();
    });
  });

  describe('GET requests', () => {
    it('makes GET request to correct URL', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1 }));

      const result = await apiClient.get('/users/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api/users/1',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        }),
      );
      expect(result).toEqual({ id: 1 });
    });

    it('includes auth header when token is set', async () => {
      setAuthToken('my-jwt-token');
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await apiClient.get('/me');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api/me',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer my-jwt-token' }),
        }),
      );
    });

    it('omits auth header when no token', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await apiClient.get('/public');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('POST requests', () => {
    it('sends JSON body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1 }));

      await apiClient.post('/users', { name: 'Test' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        }),
      );
    });
  });

  describe('error handling', () => {
    it('throws APIError on 400 with error body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(
          {
            error: { code: 'VALIDATION_ERROR', message: 'Invalid email', details: { field: 'email' } },
          },
          400,
        ),
      );

      await expect(apiClient.post('/auth/login', {})).rejects.toThrow(APIError);
    });

    it('parses error code and message from body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(
          {
            error: { code: 'NOT_FOUND', message: 'User not found' },
          },
          404,
        ),
      );

      try {
        await apiClient.get('/users/999');
        expect.fail('should throw');
      } catch (err) {
        expect(err).toBeInstanceOf(APIError);
        const apiErr = err as APIError;
        expect(apiErr.code).toBe('NOT_FOUND');
        expect(apiErr.message).toBe('User not found');
        expect(apiErr.status).toBe(404);
      }
    });

    it('throws AuthError on 401 and calls onUnauthorized', async () => {
      const onUnauth = vi.fn();
      setOnUnauthorized(onUnauth);

      mockFetch.mockResolvedValueOnce(
        jsonResponse(
          {
            error: { code: 'UNAUTHORIZED', message: 'Token expired' },
          },
          401,
        ),
      );

      try {
        await apiClient.get('/me');
        expect.fail('should throw');
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect(onUnauth).toHaveBeenCalledOnce();
      }
    });

    it('handles 204 No Content', async () => {
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const result = await apiClient.delete('/users/1');
      expect(result).toBeUndefined();
    });
  });
});
