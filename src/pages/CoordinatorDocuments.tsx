import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { useAreasQuery } from '@/hooks/queries/useReferenceQueries';
import { coordinationDocumentsApi } from '@/services/api';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { DataState } from '@/components/DataState';
import { DocumentCard } from '@/components/coordination/DocumentCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CoordinationDocumentStatus } from '@/types';
import { useNomenclature } from '@/hooks/useOrgConfig';

type StatusFilter = 'all' | CoordinationDocumentStatus;

/**
 * Listado completo de documentos de coordinacion (RFC Epica 4).
 *
 * Brinda filtros por area y estado, paginacion incremental (20 por pagina)
 * y navegacion al detalle. Antes de esta pagina los documentos solo se veian
 * embebidos en CoordinatorHome, sin vista dedicada.
 */
export function CoordinatorDocuments() {
  const navigate = useNavigate();
  const { data: areas = [] } = useAreasQuery();
  const docLabel = useNomenclature('coordination_document');
  const docPluralLabel = useNomenclature('coordination_document_plural');

  const [areaFilter, setAreaFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { items, hasMore, loadMore, isLoading, isLoadingMore, error, reload } = usePaginatedList(
    (limit, offset) =>
      coordinationDocumentsApi.list({
        limit,
        offset,
        area_id: areaFilter === 'all' ? undefined : areaFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    { deps: [areaFilter, statusFilter] },
  );

  const hasFilters = areaFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className='max-w-5xl mx-auto px-6 py-8'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='title-2-emphasized text-[#10182B]'>{docPluralLabel}</h1>
          <p className='body-2-regular text-muted-foreground mt-1'>
            Todos los {docPluralLabel.toLowerCase()} que podes gestionar
          </p>
        </div>
        <Button onClick={() => navigate('/coordinator/documents/new')} className='gap-2'>
          <Plus className='w-4 h-4' />
          Nuevo {docLabel.toLowerCase()}
        </Button>
      </div>

      {/* Filtros */}
      <div className='flex flex-wrap gap-3 mb-6'>
        <Select
          value={areaFilter === 'all' ? 'all' : String(areaFilter)}
          onValueChange={(v) => setAreaFilter(v === 'all' ? 'all' : Number(v))}
        >
          <SelectTrigger className='w-56' aria-label='Filtrar por area'>
            <SelectValue placeholder='Todas las areas' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas las areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id} value={String(area.id)}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className='w-48' aria-label='Filtrar por estado'>
            <SelectValue placeholder='Todos los estados' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los estados</SelectItem>
            <SelectItem value='pending'>Borrador</SelectItem>
            <SelectItem value='in_progress'>En progreso</SelectItem>
            <SelectItem value='published'>Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataState
        loading={isLoading}
        error={error}
        data={items}
        onRetry={reload}
        emptyState={
          <div className='text-center py-16 activity-card-bg rounded-2xl'>
            <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='headline-1-bold text-foreground mb-2'>
              {hasFilters ? 'Sin resultados' : `Aun no hay ${docPluralLabel.toLowerCase()}`}
            </h3>
            <p className='body-2-regular text-muted-foreground mb-4'>
              {hasFilters
                ? 'Probá ajustar los filtros o crear uno nuevo.'
                : `Crea tu primer ${docLabel.toLowerCase()} para empezar.`}
            </p>
            <Button onClick={() => navigate('/coordinator/documents/new')} className='gap-2'>
              <Plus className='w-4 h-4' />
              Nuevo {docLabel.toLowerCase()}
            </Button>
          </div>
        }
      >
        <div className='space-y-3'>
          {items.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onClick={() => navigate(`/coordinator/documents/${doc.id}`)} />
          ))}
        </div>

        {hasMore && (
          <div className='flex justify-center mt-6'>
            <Button
              variant='outline'
              onClick={loadMore}
              disabled={isLoadingMore}
              aria-label={`Cargar mas ${docPluralLabel.toLowerCase()}`}
            >
              {isLoadingMore ? 'Cargando...' : 'Cargar mas'}
            </Button>
          </div>
        )}
      </DataState>
    </div>
  );
}
