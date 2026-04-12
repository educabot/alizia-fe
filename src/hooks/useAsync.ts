import { useCallback, useEffect, useRef, useState } from 'react';
import { APIError } from '@/services/api-client';

/**
 * Estado para la triple "loading / error / data(+empty)" del RFC §2.4.
 * Permite a los componentes renderizar un unico <DataState> sin branches manuales.
 */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  /** Re-ejecuta la funcion async. Util para reintentos y tras mutaciones. */
  reload: () => Promise<void>;
}

/**
 * Ejecuta una funcion async al montar y expone el estado como triple.
 *
 * - `deps`: dependencias que disparan una nueva ejecucion (default: []).
 * - Si el componente se desmonta antes de que resuelva, ignora el resultado
 *   para evitar el warning de "setState on unmounted component".
 * - El error se normaliza a `Error` (los APIError se preservan tal cual).
 *
 * @example
 * const { data, isLoading, error, reload } = useAsync(
 *   () => coordinationDocumentsApi.list(),
 *   [],
 * );
 * return <DataState loading={isLoading} error={error} data={data?.items} onRetry={reload}>...</DataState>;
 */
export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Ref para que `reload` no cambie en cada render — evita que los callers
  // tengan que memoizarlo en dependencias.
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (mountedRef.current) {
        setData(result);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        const normalized = err instanceof Error ? err : new APIError('UNKNOWN_ERROR', String(err));
        setError(normalized);
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    reload();
    // deps are explicitly passed by the caller — reload is stable via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading, error, reload };
}
