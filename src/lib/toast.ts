import { toast } from 'sonner';
import { APIError, AuthError } from '@/services/api-client';
import { getErrorMessage, DEFAULT_ERROR_MESSAGE } from './error-messages';

/**
 * Muestra un toast de error, usando el catalogo de mensajes amigables.
 * Acepta cualquier error; si no es APIError, usa el mensaje por defecto.
 *
 * Uso tipico en handlers:
 * ```ts
 * try {
 *   await api.doSomething();
 *   toastSuccess('Guardado');
 * } catch (err) {
 *   showApiError(err);
 * }
 * ```
 *
 * Para AuthError (401) no muestra toast — el interceptor del api-client ya
 * redirige a /login via setOnUnauthorized.
 */
export function showApiError(err: unknown): void {
  // 401 ya lo maneja el interceptor — no duplicamos el feedback
  if (err instanceof AuthError) return;

  if (err instanceof APIError) {
    const message = getErrorMessage(err.code, err.message);
    toast.error(message);
    return;
  }

  if (err instanceof Error) {
    toast.error(err.message || DEFAULT_ERROR_MESSAGE);
    return;
  }

  toast.error(DEFAULT_ERROR_MESSAGE);
}

export function toastSuccess(message: string): void {
  toast.success(message);
}

export function toastInfo(message: string): void {
  toast.info(message);
}

export function toastWarning(message: string): void {
  toast.warning(message);
}
