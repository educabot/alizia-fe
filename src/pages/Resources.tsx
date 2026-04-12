import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { useResourcesQuery, useDeleteResourceMutation } from '@/hooks/queries/useResourceQueries';
import { useSubjectsQuery, useCourseSubjectsQuery } from '@/hooks/queries/useReferenceQueries';
import { useNomenclature } from '@/hooks/useOrgConfig';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Resource } from '@/types';

export function Resources() {
  const navigate = useNavigate();
  const { data: resources = [], isLoading } = useResourcesQuery();
  const deleteResourceMutation = useDeleteResourceMutation();
  const { data: subjects = [] } = useSubjectsQuery();
  const { data: courseSubjects = [] } = useCourseSubjectsQuery();
  const resourcePluralLabel = useNomenclature('resource_plural');

  const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);

  const handleDelete = async (resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Eliminar "${resource.title}"?`)) return;
    try {
      await deleteResourceMutation.mutateAsync(resource.id);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  // Soft filter by subject (UX only, no permissions)
  const uniqueSubjectIds = [...new Set(resources.map((r) => r.course_subject_id).filter(Boolean))] as number[];
  const subjectOptions = uniqueSubjectIds
    .map((csId) => {
      const cs = courseSubjects.find((c) => c.id === csId);
      return cs ? { id: csId, name: cs.subject_name } : null;
    })
    .filter(Boolean) as { id: number; name: string }[];

  const filtered = filterSubjectId ? resources.filter((r) => r.course_subject_id === filterSubjectId) : resources;

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='title-2-emphasized text-[#10182B]'>{resourcePluralLabel}</h1>
          <p className='body-2-regular text-muted-foreground mt-1'>Crea y gestiona tus recursos educativos</p>
        </div>
        <Button onClick={() => navigate('/resources/new')} className='gap-2 cursor-pointer'>
          <Plus className='w-4 h-4' />
          Crear recurso
        </Button>
      </div>

      {/* Soft filter */}
      {subjectOptions.length > 1 && (
        <div className='flex gap-2 mb-6'>
          <button
            type='button'
            onClick={() => setFilterSubjectId(null)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filterSubjectId === null ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Todas
          </button>
          {subjectOptions.map((opt) => (
            <button
              key={opt.id}
              type='button'
              onClick={() => setFilterSubjectId(opt.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filterSubjectId === opt.id ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='bg-white rounded-2xl p-4 border border-gray-200'>
              <Skeleton className='h-5 w-3/4 mb-3' />
              <Skeleton className='h-4 w-1/2 mb-4' />
              <Skeleton className='h-6 w-20' />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className='text-center py-16 activity-card-bg rounded-2xl'>
          <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
          <h3 className='headline-1-bold text-foreground mb-2'>
            {resources.length === 0 ? 'Sin recursos creados' : 'Sin resultados'}
          </h3>
          <p className='body-2-regular text-muted-foreground'>
            {resources.length === 0
              ? 'Haz clic en "Crear recurso" para comenzar'
              : 'Prueba cambiar el filtro de materia'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4'>
          {filtered.map((resource) => (
            <div key={resource.id} className='relative group'>
              <ResourceCard resource={resource} onClick={() => navigate(`/resources/${resource.id}`)} />
              <button
                onClick={(e) => handleDelete(resource, e)}
                className='absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 cursor-pointer'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
