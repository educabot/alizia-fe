import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, X, CloudCheck, Share } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useResourceQuery,
  useResourceTypesQuery,
  useGenerateContentMutation,
  resourceKeys,
} from '@/hooks/queries/useResourceQueries';
import { resourcesApi } from '@/services/api';
import { showApiError, toastSuccess } from '@/lib/toast';
import { DynamicContentRenderer } from '@/components/resources/DynamicContentRenderer';
import { ChatPanel } from '@/components/ai/ChatPanel';
import { GenerateButton } from '@/components/ai/GenerateButton';
import { LoadingOrb } from '@/components/ai/LoadingOrb';
import { Button } from '@/components/ui/button';
import type { ResourceType } from '@/types';

export function ResourceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resourceId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();

  const { data: currentResource } = useResourceQuery(resourceId);
  const { data: resourceTypes = [] } = useResourceTypesQuery();
  const generateMutation = useGenerateContentMutation();
  const isGenerating = generateMutation.isPending;

  const [resourceType, setResourceType] = useState<ResourceType | null>(null);
  const [localContent, setLocalContent] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentResource) {
      setLocalContent(currentResource.content || {});
      const rt = resourceTypes.find((t) => t.id === currentResource.resource_type_id);
      setResourceType(rt || null);
    }
  }, [currentResource?.id, resourceTypes]);

  const refetchResource = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: resourceKeys.detail(resourceId) });
  }, [resourceId, queryClient]);

  const handleContentChange = (content: Record<string, unknown>) => {
    setLocalContent(content);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentResource) return;
    setIsSaving(true);
    try {
      await resourcesApi.update(resourceId, { content: localContent });
      queryClient.setQueryData(resourceKeys.detail(resourceId), { ...currentResource, content: localContent });
      setHasChanges(false);
      toastSuccess('Cambios guardados');
    } catch (error) {
      showApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    await generateMutation.mutateAsync({ id: resourceId });
  };

  const handlePublish = async () => {
    try {
      await resourcesApi.update(resourceId, { status: 'active' });
      await refetchResource();
      await queryClient.invalidateQueries({ queryKey: resourceKeys.all });
      toastSuccess('Recurso publicado');
    } catch (error) {
      showApiError(error);
    }
  };

  if (!currentResource) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <LoadingOrb message='Cargando recurso...' />
      </div>
    );
  }

  const isPublished = currentResource.status === 'active';
  const schema = (resourceType?.output_schema || {}) as Record<
    string,
    { type: 'string' | 'array'; label?: string; items?: Record<string, unknown> }
  >;
  const hasContent =
    Object.keys(localContent).length > 0 &&
    Object.values(localContent).some((v) => {
      if (typeof v === 'string') return v.trim().length > 0;
      if (Array.isArray(v)) return v.length > 0;
      return false;
    });

  return (
    <div className='h-screen flex flex-col gradient-background'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-[#DAD5F6] bg-[#FFFFFF26] backdrop-blur-sm'>
        <button type='button' onClick={() => navigate('/resources')} className='cursor-pointer hover:opacity-70'>
          <ChevronLeft className='w-6 h-6 text-[#324155]' />
        </button>
        <div className='flex items-center gap-2'>
          <h1 className='header-title text-[#10182B]'>{currentResource.title}</h1>
          {!hasChanges && <CloudCheck className='w-5 h-5 text-[#324155]' />}
        </div>
        <div className='flex items-center gap-3'>
          {!hasContent && !isGenerating && (
            <GenerateButton
              onClick={handleGenerate}
              label='Generar contenido'
              isGenerating={isGenerating}
              variant='ghost'
              size='sm'
            />
          )}
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} variant='outline' size='sm' className='cursor-pointer'>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
          <Button
            onClick={!isPublished ? handlePublish : undefined}
            disabled={isPublished || isGenerating || !hasContent}
            className={`flex items-center gap-2 text-primary bg-muted border-none rounded-xl ${
              isPublished ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted hover:text-primary'
            }`}
          >
            <Share className='w-4 h-4 text-primary' />
            {isPublished ? 'Publicado' : 'Publicar'}
          </Button>
          <button type='button' onClick={() => navigate('/resources')} className='cursor-pointer hover:opacity-70'>
            <X className='w-6 h-6 text-[#324155]' />
          </button>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden p-6 gap-6'>
        {/* Left: Chat */}
        <div className='w-80 flex flex-col'>
          <ChatPanel
            entityType='resource'
            entityId={resourceId}
            onEntityUpdated={refetchResource}
            placeholder='Escribi tu mensaje para Alizia...'
            welcomeMessage={{
              title: currentResource.resource_type_name,
              content: 'Si necesitas ajustar el contenido, escribime y lo resolvemos.',
            }}
            isGenerating={isGenerating}
          />
        </div>

        {/* Center: Dynamic content */}
        <div className='flex-1 flex flex-col activity-card-bg rounded-2xl overflow-hidden'>
          <div className='p-4 px-6 border-b border-[#DAD5F6] h-14 flex items-center justify-between'>
            <h3 className='headline-1-bold text-[#10182B]'>{currentResource.title}</h3>
            {hasContent && !isPublished && (
              <GenerateButton
                onClick={handleGenerate}
                label='Regenerar'
                isGenerating={isGenerating}
                variant='ghost'
                size='sm'
              />
            )}
          </div>

          <div className='flex-1 overflow-y-auto p-6'>
            {isGenerating && !hasContent ? (
              <div className='flex items-center justify-center py-12'>
                <LoadingOrb message='Generando contenido...' />
              </div>
            ) : Object.keys(schema).length > 0 ? (
              <DynamicContentRenderer
                schema={schema}
                content={localContent}
                onChange={handleContentChange}
                readOnly={isPublished}
              />
            ) : (
              <div className='text-center py-12'>
                <p className='text-sm text-gray-400'>
                  {hasContent
                    ? 'Contenido disponible (sin esquema de tipo definido)'
                    : 'Sin contenido. Usa "Generar contenido" para comenzar.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
