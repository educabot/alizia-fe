import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { House, FileText, FolderKanban, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useFeatureFlag, useNomenclature } from '@/hooks/useOrgConfig';
import type { UserRole } from '@/types';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  /** Si se provee, el usuario debe tener AL MENOS uno de estos roles. */
  roles?: UserRole[];
  /** Feature flag de `org_config.modules` que debe estar habilitado. */
  module?: 'contenido' | 'planificacion';
}

/**
 * Sidebar — RFC §5.3.
 *
 * Sólo incluye items con destinos reales dentro de `App.tsx`. Items que el RFC
 * lista (Cursos, Mis materias, Planificación) se reincorporarán cuando existan
 * las páginas de listado correspondientes (ver gap G-5.1).
 *
 * Filtrado multi-rol: usa `hasRole(...item.roles)` en vez del rol primario, así
 * un usuario con `roles: ['teacher', 'coordinator']` ve los items de AMBOS
 * sets simultáneamente (RFC §4.2).
 */
export function Sidebar({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const location = useLocation();

  const contentEnabled = useFeatureFlag('contenido');
  const planningEnabled = useFeatureFlag('planificacion');
  const resourceLabel = useNomenclature('resource_plural');
  const documentLabel = useNomenclature('coordination_document_plural');

  const items = useMemo(() => {
    const allItems: NavItem[] = [
      {
        to: '/',
        icon: <House className='w-5 h-5' />,
        label: 'Inicio',
      },
      {
        to: '/coordinator/documents',
        icon: <FolderKanban className='w-5 h-5' />,
        // Nomenclatura dinamica — si la org renombra "documento de coordinacion", se refleja aca.
        label: documentLabel,
        roles: ['coordinator'],
      },
      {
        to: '/resources',
        icon: <FileText className='w-5 h-5' />,
        label: resourceLabel,
        roles: ['teacher'],
        module: 'contenido',
      },
      {
        to: '/admin/areas',
        icon: <Layers className='w-5 h-5' />,
        label: 'Areas',
        roles: ['admin'],
      },
    ];

    return allItems.filter((item) => {
      // Role filter — multi-rol aware
      if (item.roles && item.roles.length > 0) {
        if (!user) return false;
        if (!hasRole(...item.roles)) return false;
      }
      // Feature flag filter
      if (item.module === 'contenido' && !contentEnabled) return false;
      if (item.module === 'planificacion' && !planningEnabled) return false;
      return true;
    });
  }, [user, hasRole, contentEnabled, planningEnabled, resourceLabel, documentLabel]);

  return (
    <nav className={cn('w-16 backdrop-blur-sm border-r border-primary/15 flex flex-col items-center py-4', className)}>
      <ul className='flex flex-col gap-2'>
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <li key={item.label}>
              <Link
                to={item.to}
                title={item.label}
                aria-label={item.label}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                  isActive ? 'text-primary bg-primary/10' : 'text-[#000000b3] hover:text-[#324155] hover:bg-gray-100',
                )}
              >
                {item.icon}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
