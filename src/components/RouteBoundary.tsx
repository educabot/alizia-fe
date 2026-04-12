import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Boundary que se resetea automaticamente al navegar a otra ruta.
 *
 * ErrorBoundary es un componente de clase y no escucha location changes.
 * Usando `key={location.pathname}` React lo desmonta y remonta al navegar,
 * dejando el hasError en false — asi un error en la pagina A no deja la app
 * "rota" cuando el usuario navega a la pagina B.
 *
 * Uso: envolver cada grupo de rutas (ver App.tsx).
 */
export function RouteBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundary key={location.pathname} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}
