import { describe, it, expect } from 'vitest';
import { ERROR_MESSAGES, getErrorMessage, DEFAULT_ERROR_MESSAGE } from './error-messages';

describe('error-messages', () => {
  it('returns the mapped message for a known code', () => {
    expect(getErrorMessage('NOT_FOUND')).toBe(ERROR_MESSAGES.NOT_FOUND);
  });

  it('returns the fallback when the code is unknown', () => {
    expect(getErrorMessage('NONEXISTENT_CODE', 'Custom fallback')).toBe('Custom fallback');
  });

  it('returns DEFAULT_ERROR_MESSAGE when no fallback and code is unknown', () => {
    expect(getErrorMessage('NONEXISTENT_CODE')).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('returns DEFAULT_ERROR_MESSAGE when code is undefined', () => {
    expect(getErrorMessage(undefined)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('covers core backend error codes from the RFC catalog', () => {
    // Sanity check — esto evita que el map se deprecie en silencio si alguien
    // borra entradas clave.
    const required = [
      'VALIDATION_ERROR',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'DUPLICATE',
      'CONFLICT',
      'INTERNAL_ERROR',
      'NETWORK_ERROR',
      'AI_GENERATION_ERROR',
      'AI_RATE_LIMITED',
      'TOPICS_NOT_FULLY_COVERED',
      'LESSON_PLAN_ALREADY_EXISTS',
    ];
    for (const code of required) {
      expect(ERROR_MESSAGES[code], `missing mapping for ${code}`).toBeTruthy();
    }
  });
});
