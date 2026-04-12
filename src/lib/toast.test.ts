import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIError, AuthError } from '@/services/api-client';

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastInfoMock = vi.fn();
const toastWarningMock = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
    info: (...args: unknown[]) => toastInfoMock(...args),
    warning: (...args: unknown[]) => toastWarningMock(...args),
  },
}));

// Importamos despues del mock para que capture el modulo mockeado.
import { showApiError, toastSuccess, toastInfo, toastWarning } from './toast';
import { ERROR_MESSAGES } from './error-messages';

describe('toast', () => {
  beforeEach(() => {
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    toastInfoMock.mockReset();
    toastWarningMock.mockReset();
  });

  describe('showApiError', () => {
    it('maps APIError code to catalog message', () => {
      const err = new APIError('NOT_FOUND', 'User not found', undefined, 404);
      showApiError(err);
      expect(toastErrorMock).toHaveBeenCalledWith(ERROR_MESSAGES.NOT_FOUND);
    });

    it('falls back to err.message when code is unknown', () => {
      const err = new APIError('WEIRD_CODE', 'Backend detailed message', undefined, 500);
      showApiError(err);
      expect(toastErrorMock).toHaveBeenCalledWith('Backend detailed message');
    });

    it('does NOT toast AuthError — the 401 interceptor handles logout', () => {
      const err = new AuthError('UNAUTHORIZED', 'Expired');
      showApiError(err);
      expect(toastErrorMock).not.toHaveBeenCalled();
    });

    it('handles plain Error', () => {
      showApiError(new Error('boom'));
      expect(toastErrorMock).toHaveBeenCalledWith('boom');
    });

    it('handles non-error values', () => {
      showApiError('something bad');
      expect(toastErrorMock).toHaveBeenCalledOnce();
    });
  });

  it('toastSuccess/Info/Warning forward to sonner', () => {
    toastSuccess('ok');
    toastInfo('info');
    toastWarning('careful');
    expect(toastSuccessMock).toHaveBeenCalledWith('ok');
    expect(toastInfoMock).toHaveBeenCalledWith('info');
    expect(toastWarningMock).toHaveBeenCalledWith('careful');
  });
});
