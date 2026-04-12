import type { ReactNode } from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { APIError } from '@/services/api-client';
import { getErrorMessage } from '@/lib/error-messages';

interface DataStateProps {
  loading: boolean;
  error: Error | null;
  /** `undefined | null | []` se consideran vacio. */
  data: unknown;
  /** Contenido que se renderiza si hay datos (data truthy y no vacio). */
  children: ReactNode;
  /** Callback de reintento — si se provee, aparece un boton en el estado de error. */
  onRetry?: () => void;
  /** Slot custom para el estado vacio. */
  emptyState?: ReactNode;
  /** Mensaje simple para el estado vacio (ignorado si se usa `emptyState`). */
  emptyMessage?: string;
  /** Mensaje simple para el estado de loading. */
  loadingMessage?: string;
  /** className aplicado al contenedor de los estados (loading/error/empty). */
  className?: string;
}

function isEmpty(data: unknown): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  return false;
}

/**
 * Componente estandar para la triple "loading / error / empty / ok" del RFC §2.4.
 *
 * Renderiza `children` solo cuando `data` tiene contenido. Mantiene el patron
 * consistente en toda la app — evita que cada pagina reinvente sus propios
 * spinners y carteles de "sin datos".
 *
 * @example
 * <DataState loading={isLoading} error={error} data={documents} onRetry={reload}>
 *   {documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)}
 * </DataState>
 */
export function DataState({
  loading,
  error,
  data,
  children,
  onRetry,
  emptyState,
  emptyMessage = 'No hay datos para mostrar',
  loadingMessage = 'Cargando...',
  className = '',
}: DataStateProps) {
  if (loading) {
    return (
      <output
        aria-live='polite'
        className={`flex flex-col items-center justify-center py-12 text-[#47566C] ${className}`}
      >
        <Loader2 className='w-8 h-8 animate-spin text-primary mb-3' />
        <p className='body-2-regular'>{loadingMessage}</p>
      </output>
    );
  }

  if (error) {
    const code = error instanceof APIError ? error.code : undefined;
    const friendly = getErrorMessage(code, error.message);
    return (
      <div role='alert' className={`flex flex-col items-center justify-center py-12 text-center px-6 ${className}`}>
        <div className='w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3'>
          <AlertCircle className='w-6 h-6 text-red-500' />
        </div>
        <h3 className='headline-1-bold text-[#10182B] mb-1'>No pudimos cargar los datos</h3>
        <p className='body-2-regular text-[#47566C] mb-4 max-w-md'>{friendly}</p>
        {onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity'
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (isEmpty(data)) {
    if (emptyState) return <>{emptyState}</>;
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <Inbox className='w-10 h-10 text-muted-foreground mb-3' />
        <p className='body-2-regular text-muted-foreground'>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
