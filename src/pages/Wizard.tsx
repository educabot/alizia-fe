import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { useSubjectsQuery, useAreasQuery, useTopicsQuery } from '@/hooks/queries/useReferenceQueries';
import { useCreateDocumentMutation } from '@/hooks/queries/useCoordinationQueries';
import { showApiError, toastSuccess } from '@/lib/toast';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { DateInput } from '@/components/ui/date-input';
import { Button } from '@/components/ui/button';
import {
  TopicSelector,
  SubjectClassConfig,
  allSubjectsHaveTopics,
  buildInitialSubjectConfig,
  type SubjectConfigMap,
} from '@/components/coordination';
import type { CoordinationDocumentCreate } from '@/types';

export function Wizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id ? parseInt(id, 10) : 0;
  // Cuando el wizard se abre desde `/coordinator/documents/new` no hay curso —
  // el back vuelve al listado de documentos en vez de a un curso inexistente.
  const backUrl = courseId > 0 ? `/coordinator/courses/${courseId}` : '/coordinator/documents';

  const { data: subjects = [] } = useSubjectsQuery();
  const { data: areas = [] } = useAreasQuery();
  const { data: topics = [] } = useTopicsQuery();

  const [step, setStep] = useState(1);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subjectsConfig, setSubjectsConfig] = useState<SubjectConfigMap>({});
  const createMutation = useCreateDocumentMutation();
  const isCreating = createMutation.isPending;

  // Filter subjects by selected area
  const areaSubjects = useMemo(() => (areaId ? subjects.filter((s) => s.area_id === areaId) : []), [areaId, subjects]);

  const initSubjectsConfig = (newAreaId: number) => {
    setAreaId(newAreaId);
    const subs = subjects.filter((s) => s.area_id === newAreaId);
    setSubjectsConfig(buildInitialSubjectConfig(subs));
  };

  const handleCreate = async () => {
    if (!areaId) return;

    const area = areas.find((a) => a.id === areaId);
    const data: CoordinationDocumentCreate = {
      name: `Itinerario ${area?.name ?? 'Area'}`,
      area_id: areaId,
      start_date: startDate,
      end_date: endDate,
      topic_ids: selectedTopicIds,
      subjects: Object.entries(subjectsConfig).map(([sid, sd]) => ({
        subject_id: Number(sid),
        class_count: sd.class_count,
        topic_ids: sd.topic_ids,
      })),
    };

    try {
      const doc = await createMutation.mutateAsync(data);
      toastSuccess('Documento creado');
      navigate(`/coordinator/documents/${doc.id}`);
    } catch (error) {
      showApiError(error);
    }
  };

  const progress = (step / 3) * 100;
  const canAdvanceStep1 = areaId !== null && selectedTopicIds.length > 0;
  const canAdvanceStep2 = Boolean(startDate && endDate);
  const canCreate = allSubjectsHaveTopics(areaSubjects, subjectsConfig);

  return (
    <div className='fixed inset-0 z-50 gradient-background flex flex-col'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-96 h-96 bg-linear-to-br from-[#DAD5F6]/10 to-transparent rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-20 w-80 h-80 bg-linear-to-br from-[#01ceaa]/10 to-transparent rounded-full blur-3xl' />
      </div>

      {/* Scrollable content area */}
      <div className='relative flex-1 overflow-y-auto py-8 px-6'>
        <div className='max-w-4xl mx-auto pb-24'>
          <button
            type='button'
            onClick={() => navigate(backUrl)}
            className='absolute top-6 right-6 p-2 text-gray-600 hover:text-gray-900 transition-colors z-10'
            aria-label='Cerrar wizard'
          >
            <X className='w-6 h-6 cursor-pointer' />
          </button>

          <Progress value={progress} className='mb-6 h-2' />

          {/* Step 1: Select area + topics */}
          {step === 1 && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Selecciona el area y los temas</h2>
                <p className='body-2-regular text-[#2C2C2C]'>
                  Elegi el area de conocimiento y los temas que va a cubrir este documento.
                </p>
              </div>

              {/* Area selector */}
              <div className='space-y-2'>
                <Label>Area</Label>
                <select
                  value={areaId ?? ''}
                  onChange={(e) => initSubjectsConfig(Number(e.target.value))}
                  className='w-full p-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
                >
                  <option value=''>Seleccionar area...</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic tree */}
              {areaId && (
                <TopicSelector
                  topics={topics}
                  selected={selectedTopicIds}
                  onSelect={setSelectedTopicIds}
                  helpText='Seleccioná los temas que va a cubrir el documento.'
                />
              )}
            </div>
          )}

          {/* Step 2: Dates + class count per subject */}
          {step === 2 && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Fechas y clases</h2>
                <p className='body-2-regular text-[#2C2C2C]'>
                  Defini el periodo de trabajo y cuantas clases va a tener cada disciplina.
                </p>
              </div>

              <div className='space-y-4'>
                <h3 className='text-[#10182B] headline-1-bold'>Periodo de trabajo</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col gap-3'>
                    <Label className='text-[#10182B]'>Fecha de inicio</Label>
                    <DateInput
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder='DD/MM/AAAA'
                    />
                  </div>
                  <div className='flex flex-col gap-3'>
                    <Label className='text-[#10182B]'>Fecha de fin</Label>
                    <DateInput value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder='DD/MM/AAAA' />
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='text-[#10182B] headline-1-bold'>Clases por disciplina</h3>
                <SubjectClassConfig
                  subjects={areaSubjects}
                  value={subjectsConfig}
                  onChange={setSubjectsConfig}
                  availableTopicIds={selectedTopicIds}
                  topics={topics}
                  mode='class_count'
                />
              </div>
            </div>
          )}

          {/* Step 3: Assign topics to subjects */}
          {step === 3 && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Temas por disciplina</h2>
                <p className='body-2-regular text-[#2C2C2C]'>Asigna los temas seleccionados a cada disciplina.</p>
              </div>

              <SubjectClassConfig
                subjects={areaSubjects}
                value={subjectsConfig}
                onChange={setSubjectsConfig}
                availableTopicIds={selectedTopicIds}
                topics={topics}
                mode='topics'
              />
            </div>
          )}
        </div>
      </div>

      {/* Fixed footer */}
      <div className='relative backdrop-blur-sm'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          {step === 1 && (
            <div className='flex justify-end'>
              <Button onClick={() => setStep(2)} disabled={!canAdvanceStep1} className='gap-2 cursor-pointer'>
                Siguiente
                <ArrowRight />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className='flex justify-between items-center'>
              <button
                type='button'
                onClick={() => setStep(1)}
                className='text-primary font-medium cursor-pointer hover:underline'
              >
                Anterior
              </button>
              <Button onClick={() => setStep(3)} disabled={!canAdvanceStep2} className='cursor-pointer'>
                Siguiente
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className='flex justify-between items-center'>
              <button
                type='button'
                onClick={() => setStep(2)}
                className='text-primary font-medium cursor-pointer hover:underline'
              >
                Anterior
              </button>
              <Button onClick={handleCreate} disabled={!canCreate || isCreating} className='cursor-pointer'>
                {isCreating ? 'Creando...' : 'Crear documento'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
