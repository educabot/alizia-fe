import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, GraduationCap, Users, FileText, Plus } from 'lucide-react';
import {
  useCoursesQuery,
  useCourseSubjectsQuery,
  useAreasQuery,
  useSubjectsQuery,
} from '@/hooks/queries/useReferenceQueries';
import { useCoordinationDocumentsQuery } from '@/hooks/queries/useCoordinationQueries';
import { useNomenclature } from '@/hooks/useOrgConfig';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/components/coordination/DocumentCard';
import { LoadingOrb } from '@/components/ai/LoadingOrb';

export function Course() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = parseInt(id || '0', 10);

  const { data: courses = [] } = useCoursesQuery();
  const { data: courseSubjects = [] } = useCourseSubjectsQuery();
  const { data: areas = [] } = useAreasQuery();
  const { data: subjects = [] } = useSubjectsQuery();
  const docPluralLabel = useNomenclature('coordination_document_plural');
  const { data: documents = [], isLoading } = useCoordinationDocumentsQuery();

  const course = courses.find((c) => c.id === courseId);

  const courseCourseSubjects = useMemo(
    () => courseSubjects.filter((cs) => cs.course_id === courseId),
    [courseSubjects, courseId],
  );

  // Documents linked to this course via any of its subjects' areas
  const courseDocuments = useMemo(() => {
    if (!course) return [];
    const subjectIds = new Set(courseCourseSubjects.map((cs) => cs.subject_id));
    const areaIds = new Set(subjects.filter((s) => subjectIds.has(s.id)).map((s) => s.area_id));
    return documents.filter((d) => areaIds.has(d.area_id));
  }, [course, courseCourseSubjects, documents, subjects]);

  if (!course) {
    return (
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <p className='body-2-regular text-muted-foreground'>Curso no encontrado</p>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-8'>
      {/* Header */}
      <button
        type='button'
        onClick={() => navigate('/')}
        className='flex items-center gap-4 mb-6 cursor-pointer transition-colors hover:text-gray-600'
      >
        <ChevronLeft className='text-[#10182B]' />
        <h1 className='title-2-emphasized text-[#10182B]'>Curso {course.name}</h1>
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6'>
        {/* Left column */}
        <div className='space-y-6'>
          {/* Course subjects */}
          <section>
            <div className='flex items-center gap-2 mb-4'>
              <Users className='text-[#10182B]' />
              <h2 className='headline-emphasized text-[#10182B]'>Materias y docentes</h2>
              <span className='body-1-regular text-muted-foreground'>({courseCourseSubjects.length})</span>
            </div>

            {courseCourseSubjects.length === 0 ? (
              <div className='activity-card-bg backdrop-blur-sm border-slate-200 rounded-2xl p-6'>
                <p className='body-2-regular text-muted-foreground'>No hay materias asignadas a este curso.</p>
              </div>
            ) : (
              <div className='activity-card-bg backdrop-blur-sm border-slate-200 rounded-2xl p-4 space-y-3'>
                {courseCourseSubjects.map((cs) => (
                  <div key={cs.id} className='flex items-center justify-between p-4 bg-[#FFFFFF4D] rounded-xl'>
                    <div>
                      <h4 className='headline-2-semi-bold text-[#10182B]'>{cs.subject_name}</h4>
                      <p className='body-2-regular text-muted-foreground'>
                        {cs.teacher_name ?? 'Sin docente asignado'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Coordination documents */}
          <section>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <FileText className='text-[#10182B]' />
                <h2 className='headline-emphasized text-[#10182B]'>{docPluralLabel}</h2>
                <span className='body-1-regular text-muted-foreground'>({courseDocuments.length})</span>
              </div>
              <Button
                type='button'
                size='sm'
                onClick={() => navigate(`/coordinator/courses/${courseId}/documents/new`)}
                className='flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />
                Crear documento
              </Button>
            </div>

            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <LoadingOrb message='Cargando documentos...' />
              </div>
            ) : courseDocuments.length === 0 ? (
              <div className='activity-card-bg backdrop-blur-sm border-slate-200 rounded-2xl p-6 text-center'>
                <p className='body-2-regular text-muted-foreground'>
                  Aún no hay documentos de coordinación para las áreas de este curso.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {courseDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onClick={() => navigate(`/coordinator/documents/${doc.id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column — course info */}
        <aside>
          <div className='flex items-center gap-2 mb-4'>
            <GraduationCap className='text-[#10182B]' />
            <h2 className='headline-emphasized text-[#10182B]'>Sobre el curso</h2>
          </div>

          <div className='fill-primary backdrop-blur-sm border-slate-200 rounded-2xl p-6'>
            <div className='space-y-4'>
              <InfoRow label='NOMBRE' value={course.name} />
              <InfoRow label='CICLO LECTIVO' value={String(course.school_year)} />
              <InfoRow label='MATERIAS' value={String(courseCourseSubjects.length)} />
              <InfoRow
                label='ÁREAS'
                value={
                  areas
                    .filter((a) =>
                      courseCourseSubjects.some((cs) => {
                        const subj = subjects.find((s) => s.id === cs.subject_id);
                        return subj?.area_id === a.id;
                      }),
                    )
                    .map((a) => a.name)
                    .join(', ') || '—'
                }
                isLast
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className={isLast ? '' : 'pb-4 border-b border-slate-200'}>
      <p className='headline-2-semi-bold text-foreground mb-1'>{label}</p>
      <p className='body-2-regular text-foreground'>{value}</p>
    </div>
  );
}
