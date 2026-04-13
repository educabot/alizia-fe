import { useNavigate } from 'react-router-dom';
import { FileText, Users, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCoursesQuery, useCourseSubjectsQuery } from '@/hooks/queries/useReferenceQueries';
import { useCoordinationDocumentsQuery } from '@/hooks/queries/useCoordinationQueries';
import { DataState } from '@/components/DataState';
import { useNomenclature } from '@/hooks/useOrgConfig';
import { DocumentCard } from '@/components/coordination/DocumentCard';
import { PlanningProgressBar } from '@/components/dashboard/PlanningProgressBar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CourseOverview } from '@/components/dashboard/CourseOverview';
import { PublishedDocumentsCard } from '@/components/dashboard/PublishedDocumentsCard';
import { MOCK_PLANNING_PROGRESS } from '@/mocks/mock-config';

export function CoordinatorHome() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: courses = [] } = useCoursesQuery();
  const { data: courseSubjects = [] } = useCourseSubjectsQuery();
  const { data: documents = [], isLoading: docsLoading, error: docsError } = useCoordinationDocumentsQuery();
  const documentLabel = useNomenclature('coordination_document');
  const documentPluralLabel = useNomenclature('coordination_document_plural');
  const courseLabel = useNomenclature('course');
  const coursePluralLabel = useNomenclature('course_plural');

  const firstName = user?.name.split(' ')[0] || '';

  // Use mock progress for now (backend Phase 7 will provide real data)
  const planningProgress = MOCK_PLANNING_PROGRESS;

  const publishedCount = documents.filter((d) => d.status === 'published').length;
  const inProgressCount = documents.filter((d) => d.status === 'in_progress').length;

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <div className='mb-8'>
        <h1 className='title-2-emphasized text-[#10182B]'>Hola {firstName},</h1>
        <p className='body-2-regular text-muted-foreground mt-1'>Resumen de tu trabajo como coordinador</p>
      </div>

      {/* Stats row */}
      <div className='grid grid-cols-3 gap-4 mb-8 dashboard-section'>
        <StatsCard
          icon={FileText}
          label={documentPluralLabel}
          value={documents.length}
          sublabel={`${publishedCount} publicados`}
          onClick={() => navigate('/coordinator/documents')}
        />
        <StatsCard
          icon={Users}
          label={coursePluralLabel}
          value={courses.length}
          onClick={() => navigate(`/coordinator/courses/${courses[0]?.id}`)}
        />
        <StatsCard icon={BarChart3} label='En progreso' value={inProgressCount} sublabel='documentos activos' />
      </div>

      <div className='grid grid-cols-[1fr_320px] gap-6'>
        {/* Left: Documents */}
        <div>
          <h2 className='headline-1-bold text-[#10182B] mb-4'>{documentPluralLabel}</h2>
          <DataState
            loading={docsLoading}
            error={docsError}
            data={documents}
            emptyState={
              <div className='text-center py-12 activity-card-bg rounded-2xl'>
                <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='headline-1-bold text-foreground mb-2'>Sin documentos</h3>
                <p className='body-2-regular text-muted-foreground'>
                  Selecciona un {courseLabel.toLowerCase()} para crear un {documentLabel.toLowerCase()}.
                </p>
              </div>
            }
          >
            <div className='space-y-3'>
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => navigate(`/coordinator/documents/${doc.id}`)}
                />
              ))}
            </div>
          </DataState>

          {/* Course list */}
          <h2 className='headline-1-bold text-[#10182B] mb-4 mt-8'>Mis {coursePluralLabel.toLowerCase()}</h2>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3'>
            {courses.map((course) => (
              <CourseOverview
                key={course.id}
                course={course}
                subjectCount={courseSubjects.filter((cs) => cs.course_id === course.id).length}
                onClick={() => navigate(`/coordinator/courses/${course.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Right: Published docs + Planning progress */}
        <div className='space-y-6'>
          <PublishedDocumentsCard
            documents={documents}
            onViewDocument={(doc) => navigate(`/coordinator/documents/${doc.id}`)}
          />

          <div>
            <h2 className='headline-1-bold text-[#10182B] mb-4'>Progreso de planificacion</h2>
            <div className='activity-card-bg rounded-2xl p-4 space-y-4'>
              {planningProgress.length > 0 ? (
                planningProgress.map((p) => <PlanningProgressBar key={p.course_subject_id} progress={p} />)
              ) : (
                <p className='text-sm text-gray-400 text-center py-4'>Sin datos de progreso</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
