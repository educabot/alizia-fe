import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginatedResponse } from '@/types';
import { APIError } from '@/services/api-client';

interface UsePaginatedListOptions {
  /** Tamano de pagina — default 20, alineado con el backend. */
  limit?: number;
  /** Dependencias que, al cambiar, reinician la lista desde cero. */
  deps?: React.DependencyList;
  /** Si es false, no carga automaticamente al montar. Default: true. */
  enabled?: boolean;
}

export interface PaginatedListState<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  /** Carga la siguiente pagina (si hasMore). No hace nada si ya esta cargando. */
  loadMore: () => Promise<void>;
  /** Vuelve a cargar desde la pagina 0. Util post-mutaciones o para retry. */
  reload: () => Promise<void>;
}

/**
 * Hook para listas paginadas con el patron "has more" del RFC §3.1.
 *
 * Acumula items entre llamadas, expone `hasMore` para renderizar un boton
 * "Cargar mas", y soporta reset mediante `deps` (ej. cambio de filtros).
 *
 * @example
 * const { items, hasMore, loadMore, isLoading, error, reload } = usePaginatedList(
 *   (limit, offset) => coordinationDocumentsApi.list({ limit, offset, status }),
 *   { deps: [status] },
 * );
 *
 * return (
 *   <DataState loading={isLoading} error={error} data={items} onRetry={reload}>
 *     {items.map(...)}
 *     {hasMore && <button onClick={loadMore}>Cargar mas</button>}
 *   </DataState>
 * );
 */
export function usePaginatedList<T>(
  fetcher: (limit: number, offset: number) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedListOptions = {},
): PaginatedListState<T> {
  const { limit = 20, deps = [], enabled = true } = options;

  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // El fetcher suele cambiar en cada render (closure sobre params). Guardamos
  // el ultimo via ref para que `loadMore`/`reload` sean estables.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // El offset se trackea aparte de items.length para evitar races cuando una
  // request mas nueva entra antes que la previa (filtros que cambian rapido).
  const offsetRef = useRef(0);

  const reload = useCallback(async () => {
    offsetRef.current = 0;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcherRef.current(limit, 0);
      if (!mountedRef.current) return;
      setItems(res.items);
      setHasMore(res.more);
      offsetRef.current = res.items.length;
    } catch (err) {
      if (!mountedRef.current) return;
      const normalized = err instanceof Error ? err : new APIError('UNKNOWN_ERROR', String(err));
      setError(normalized);
      setItems([]);
      setHasMore(false);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;
    setIsLoadingMore(true);
    setError(null);
    try {
      const res = await fetcherRef.current(limit, offsetRef.current);
      if (!mountedRef.current) return;
      setItems((prev) => [...prev, ...res.items]);
      setHasMore(res.more);
      offsetRef.current += res.items.length;
    } catch (err) {
      if (!mountedRef.current) return;
      const normalized = err instanceof Error ? err : new APIError('UNKNOWN_ERROR', String(err));
      setError(normalized);
    } finally {
      if (mountedRef.current) setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, limit]);

  useEffect(() => {
    if (enabled) reload();
    // Deps are passed by the caller; reload is stable via ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { items, hasMore, isLoading, isLoadingMore, error, loadMore, reload };
}
