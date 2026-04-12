import { useParams, useNavigate } from 'react-router-dom';
import {
  useCoursesQuery,
  useCourseSubjectsQuery,
  useSubjectsQuery,
  useAreasQuery,
} from '@/hooks/queries/useReferenceQueries';
import { useLessonPlansQuery } from '@/hooks/queries/useTeachingQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import { ClassCard } from '@/components/teaching/ClassCard';

export function TeacherCourseSubject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const csId = parseInt(id || '0', 10);

  const { data: courses = [] } = useCoursesQuery();
  const { data: courseSubjects = [] } = useCourseSubjectsQuery();
  const { data: subjects = [] } = useSubjectsQuery();
  const { data: areas = [] } = useAreasQuery();
  const { data: lessonPlans = [], isLoading } = useLessonPlansQuery(csId);

  const cs = courseSubjects.find((c) => c.id === csId);
  const course = cs ? courses.find((c) => c.id === cs.course_id) : null;
  const subject = cs ? subjects.find((s) => s.id === cs.subject_id) : null;
  const subjectArea = subject ? areas.find((a) => a.id === subject.area_id) : null;

  if (!cs || !course) {
    return <div className='p-8 text-gray-500'>Curso-materia no encontrado</div>;
  }

  return (
    <div className='max-w-7xl mx-auto px-6 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <button
          onClick={() => navigate('/')}
          className='flex items-center gap-4 cursor-pointer transition-colors hover:text-gray-600'
        >
          <ChevronLeft className='text-[#10182B]' />
          <h1 className='title-2-emphasized text-[#10182B]'>
            {cs.course_name} - {cs.subject_name}
          </h1>
        </button>
      </div>

      {/* Course info */}
      <div className='mb-8 flex gap-4 text-sm text-gray-600'>
        {subjectArea && <span>Area: {subjectArea.name}</span>}
        <span>Curso: {course.name}</span>
        <span>Ciclo: {course.school_year}</span>
      </div>

      {/* Lesson plan list */}
      <div className='space-y-3'>
        <h2 className='headline-1-bold text-[#10182B] mb-4'>Mis clases</h2>

        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className='bg-white/60 backdrop-blur-sm border-slate-200 rounded-2xl'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-20' />
                      <Skeleton className='h-6 w-64' />
                    </div>
                    <Skeleton className='h-8 w-24 rounded-lg' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : lessonPlans.length === 0 ? (
          <Card className='bg-white/50 backdrop-blur-sm border-slate-200 rounded-3xl'>
            <CardContent className='py-12 text-center'>
              <div className='text-5xl mb-4'>📋</div>
              <h3 className='headline-1-bold text-foreground mb-2'>Sin clases asignadas</h3>
              <p className='body-2-regular text-muted-foreground'>
                El coordinador aun no ha publicado el documento de coordinacion para esta materia.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-3 activity-card-bg backdrop-blur-sm p-3 rounded-2xl'>
            {lessonPlans.map((plan) => (
              <ClassCard
                key={plan.class_number}
                plan={plan}
                onClick={() => {
                  if (plan.id !== null) {
                    navigate(`/teacher/plans/${plan.id}`);
                  } else {
                    navigate(`/teacher/courses/${csId}/plans/${plan.class_number}/new`);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
