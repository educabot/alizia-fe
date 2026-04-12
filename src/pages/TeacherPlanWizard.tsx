import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useActivitiesByMomentQuery, useFontsQuery } from '@/hooks/queries/useReferenceQueries';
import { useCreateLessonPlanMutation } from '@/hooks/queries/useTeachingQueries';
import { useConfigStore } from '@/store/configStore';
import { MomentEditor, validateMoments } from '@/components/teaching/MomentEditor';
import { MomentsValidation } from '@/components/teaching/MomentsValidation';
import { ResourceModeToggle } from '@/components/teaching/ResourceModeToggle';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import type { LessonPlanCreate, MomentKey, ResourcesMode } from '@/types';

export function TeacherPlanWizard() {
  const { csId, classNumber } = useParams();
  const navigate = useNavigate();
  const courseSubjectId = parseInt(csId || '0');
  const classNum = parseInt(classNumber || '0');

  const { data: activitiesByMoment = { apertura: [], desarrollo: [], cierre: [] } } = useActivitiesByMomentQuery();
  const { data: fonts = [] } = useFontsQuery();
  const orgConfig = useConfigStore((s) => s.orgConfig);

  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState('');
  const [moments, setMoments] = useState<Record<MomentKey, number[]>>({
    apertura: [],
    desarrollo: [],
    cierre: [],
  });
  const [resourcesMode, setResourcesMode] = useState<ResourcesMode>('global');
  const [globalFontIds, setGlobalFontIds] = useState<number[]>([]);
  const createMutation = useCreateLessonPlanMutation();

  const updateMoment = (key: MomentKey, activityIds: number[]) => {
    setMoments((prev) => ({ ...prev, [key]: activityIds }));
  };

  const { valid: momentsValid } = validateMoments(moments, orgConfig.desarrollo_max_activities);

  const handleCreate = async () => {
    const data: LessonPlanCreate = {
      course_subject_id: courseSubjectId,
      coordination_document_id: 0, // Will be resolved by backend from course_subject context
      class_number: classNum,
      title: objective.slice(0, 80) || undefined,
      moments: {
        apertura: { activities: moments.apertura, activityContent: {} },
        desarrollo: { activities: moments.desarrollo, activityContent: {} },
        cierre: { activities: moments.cierre, activityContent: {} },
      },
      resources_mode: resourcesMode,
      fonts: resourcesMode === 'global' ? { global: globalFontIds } : undefined,
    };

    try {
      const plan = await createMutation.mutateAsync(data);
      navigate(`/teacher/plans/${plan.id}`);
    } catch (_error) {
      // mutation error — TQ handles retry; button re-enables via isPending
    }
  };

  const progress = (step / 2) * 100;

  return (
    <div className='fixed inset-0 z-50 gradient-background flex flex-col'>
      {/* Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-96 h-96 bg-linear-to-br from-[#DAD5F6]/10 to-transparent rounded-full blur-3xl' />
        <div className='absolute bottom-20 right-20 w-80 h-80 bg-linear-to-br from-[#01ceaa]/10 to-transparent rounded-full blur-3xl' />
      </div>

      <div className='relative flex-1 overflow-y-auto py-8 px-6'>
        <div className='max-w-4xl mx-auto pb-24'>
          <button
            onClick={() => navigate(`/teacher/courses/${courseSubjectId}`)}
            className='absolute top-6 right-6 p-2 text-gray-600 hover:text-gray-900 transition-colors z-10'
          >
            <X className='w-6 h-6 cursor-pointer' />
          </button>

          <Progress value={progress} className='mb-6 h-2' />

          {/* Step 1: Class details */}
          {step === 1 && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Detalles de la clase {classNum}</h2>
                <p className='body-2-regular text-[#2C2C2C]'>
                  Revisa la informacion de la clase antes de continuar con la planificacion.
                </p>
              </div>

              <div className='border-t border-[#DAD5F6] pt-6'>
                <h3 className='headline-1-bold text-secondary-foreground mb-2'>Objetivo</h3>
                <p className='body-2-regular text-muted-foreground mb-2'>
                  Defini el objetivo de la clase. Podes modificarlo luego.
                </p>
                <Textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder='Ingresa el objetivo de la clase...'
                  className='min-h-25 resize-none'
                />
              </div>
            </div>
          )}

          {/* Step 2: Moments + resources */}
          {step === 2 && (
            <div className='space-y-6'>
              <div className='space-y-2'>
                <h2 className='title-2-bold text-[#2C2C2C]'>Momentos de la clase</h2>
                <p className='body-2-regular text-[#2C2C2C]'>
                  Agrega actividades para la apertura, el desarrollo y el cierre.
                </p>
              </div>

              <div className='flex gap-6'>
                {/* Moments column */}
                <div className='flex-1 space-y-4'>
                  <h3 className='headline-1-bold text-secondary-foreground'>Actividades por momento</h3>

                  <MomentEditor
                    momentKey='apertura'
                    label='Apertura / Motivacion'
                    selectedActivityIds={moments.apertura}
                    availableActivities={activitiesByMoment.apertura}
                    onActivitiesChange={(ids) => updateMoment('apertura', ids)}
                    maxActivities={1}
                  />

                  <MomentEditor
                    momentKey='desarrollo'
                    label='Desarrollo / Construccion'
                    selectedActivityIds={moments.desarrollo}
                    availableActivities={activitiesByMoment.desarrollo}
                    onActivitiesChange={(ids) => updateMoment('desarrollo', ids)}
                    maxActivities={orgConfig.desarrollo_max_activities}
                  />

                  <MomentEditor
                    momentKey='cierre'
                    label='Cierre / Metacognicion'
                    selectedActivityIds={moments.cierre}
                    availableActivities={activitiesByMoment.cierre}
                    onActivitiesChange={(ids) => updateMoment('cierre', ids)}
                    maxActivities={1}
                  />

                  <MomentsValidation moments={moments} maxDesarrolloActivities={orgConfig.desarrollo_max_activities} />
                </div>

                {/* Resources column */}
                <div className='w-72 shrink-0 space-y-4'>
                  <h3 className='headline-1-bold text-secondary-foreground'>Fuentes</h3>

                  <div className='activity-card-bg rounded-2xl p-4 space-y-3'>
                    <ResourceModeToggle value={resourcesMode} onChange={setResourcesMode} />

                    {resourcesMode === 'global' && (
                      <div className='space-y-2'>
                        <p className='text-xs text-gray-500'>Selecciona fuentes para toda la clase</p>
                        {fonts.map((font) => (
                          <label key={font.id} className='flex items-center gap-2 text-sm cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={globalFontIds.includes(font.id)}
                              onChange={() => {
                                setGlobalFontIds((prev) =>
                                  prev.includes(font.id) ? prev.filter((id) => id !== font.id) : [...prev, font.id],
                                );
                              }}
                              className='rounded'
                            />
                            <span className='text-gray-700 truncate'>{font.name}</span>
                          </label>
                        ))}
                        {fonts.length === 0 && <p className='text-xs text-gray-400 italic'>Sin fuentes disponibles</p>}
                      </div>
                    )}

                    {resourcesMode === 'per_moment' && (
                      <p className='text-xs text-gray-400 italic'>
                        Configura fuentes por momento en el editor del plan
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='relative backdrop-blur-sm'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          {step === 1 && (
            <div className='flex justify-end'>
              <Button onClick={() => setStep(2)} className='gap-2 cursor-pointer'>
                Comenzar
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
              <Button onClick={handleCreate} disabled={!momentsValid || createMutation.isPending} className='cursor-pointer'>
                {createMutation.isPending ? 'Creando...' : 'Planificar clase'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
