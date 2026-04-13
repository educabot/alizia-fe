import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useResourceTypesQuery, useCreateResourceMutation } from '@/hooks/queries/useResourceQueries';
import { useFontsQuery } from '@/hooks/queries/useReferenceQueries';
import { showApiError } from '@/lib/toast';
import { ResourceTypeSelector } from '@/components/resources/ResourceTypeSelector';
import { FontRequirementSelector } from '@/components/resources/FontRequirementSelector';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ResourceType } from '@/types';

export function ResourceCreate() {
  const navigate = useNavigate();
  const { data: resourceTypes = [] } = useResourceTypesQuery();
  const { data: fonts = [] } = useFontsQuery();
  const createResourceMutation = useCreateResourceMutation();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [selectedFontId, setSelectedFontId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const totalSteps = selectedType?.requires_font ? 3 : 2;
  const progress = (step / totalSteps) * 100;

  const handleTypeSelect = (type: ResourceType) => {
    setSelectedType(type);
    setSelectedFontId(null);
    setTitle(`${type.name} - Nuevo`);
  };

  const handleNext = () => {
    if (step === 1 && selectedType?.requires_font) {
      setStep(2);
    } else {
      handleCreate();
    }
  };

  const handleCreate = async () => {
    if (!selectedType) return;
    setIsCreating(true);
    try {
      const resource = await createResourceMutation.mutateAsync({
        title: title.trim() || `${selectedType.name} - Nuevo`,
        resource_type_id: selectedType.id,
        font_id: selectedFontId || undefined,
      });
      navigate(`/resources/${resource.id}`, { replace: true });
    } catch (error) {
      showApiError(error);
      setIsCreating(false);
    }
  };

  const canProceed =
    step === 1 ? selectedType !== null : step === 2 && selectedType?.requires_font ? selectedFontId !== null : true;

  return (
    <div className='fixed inset-0 z-50 gradient-background flex flex-col'>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-96 h-96 bg-linear-to-br from-[#DAD5F6]/10 to-transparent rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-20 w-80 h-80 bg-linear-to-br from-[#01ceaa]/10 to-transparent rounded-full blur-3xl' />
      </div>

      <div className='relative flex-1 overflow-y-auto py-8 px-6'>
        <div className='max-w-2xl mx-auto pb-24'>
          <button
            onClick={() => navigate('/resources')}
            className='absolute top-6 right-6 p-2 text-gray-600 hover:text-gray-900 transition-colors z-10'
          >
            <X className='w-6 h-6 cursor-pointer' />
          </button>

          <Progress value={progress} className='mb-6 h-2' />

          {/* Step 1: Select type */}
          {step === 1 && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Tipo de recurso</h2>
                <p className='body-2-regular text-[#2C2C2C]'>Selecciona el tipo de recurso que quieres crear.</p>
              </div>

              <ResourceTypeSelector resourceTypes={resourceTypes} selected={selectedType} onSelect={handleTypeSelect} />

              {selectedType && (
                <div className='border-t border-[#DAD5F6] pt-4'>
                  <label className='text-sm font-medium text-gray-700'>Titulo</label>
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='mt-1 w-full px-3 py-2 border border-[#E4E8EF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
                    placeholder='Titulo del recurso...'
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select font (conditional) */}
          {step === 2 && selectedType?.requires_font && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Fuente bibliografica</h2>
                <p className='body-2-regular text-[#2C2C2C]'>
                  Este tipo de recurso requiere una fuente. Selecciona una del listado.
                </p>
              </div>

              <FontRequirementSelector fonts={fonts} selectedFontId={selectedFontId} onSelect={setSelectedFontId} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='relative backdrop-blur-sm'>
        <div className='max-w-2xl mx-auto px-6 py-4 flex justify-between items-center'>
          {step > 1 ? (
            <button
              type='button'
              onClick={() => setStep(step - 1)}
              className='text-primary font-medium cursor-pointer hover:underline flex items-center gap-1'
            >
              <ArrowLeft className='w-4 h-4' />
              Anterior
            </button>
          ) : (
            <div />
          )}
          <Button onClick={handleNext} disabled={!canProceed || isCreating} className='gap-2 cursor-pointer'>
            {isCreating ? 'Creando...' : step < totalSteps ? 'Siguiente' : 'Crear recurso'}
            {!isCreating && <ArrowRight className='w-4 h-4' />}
          </Button>
        </div>
      </div>
    </div>
  );
}
