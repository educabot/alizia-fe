import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCourseSubjectsQuery } from '@/hooks/queries/useReferenceQueries';
import { useNomenclature } from '@/hooks/useOrgConfig';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PendingPlansCard } from '@/components/dashboard/PendingPlansCard';
import { UpcomingClassesWidget } from '@/components/dashboard/UpcomingClassesWidget';
import { MOCK_NOTIFICATIONS } from '@/mocks/mock-config';
import type { Notification } from '@/types';

export function TeacherHome() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: courseSubjects = [] } = useCourseSubjectsQuery();
  const subjectPluralLabel = useNomenclature('subject_plural');

  const firstName = user?.name.split(' ')[0] || '';
  const teacherId = user?.id;

  // Filter teacher's course-subjects
  const myCourseSubjects = courseSubjects.filter((cs) => cs.teacher_id === teacherId);

  // Use mock notifications (backend Phase 7 will provide real data)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <div className='mb-8'>
        <h1 className='title-2-emphasized text-[#10182B]'>Hola {firstName},</h1>
        <p className='body-2-regular text-muted-foreground mt-1'>Resumen de tus materias y planificaciones</p>
      </div>

      {/* Stats row */}
      <div className='grid grid-cols-3 gap-4 mb-8 dashboard-section'>
        <StatsCard icon={BookOpen} label={subjectPluralLabel} value={myCourseSubjects.length} />
        <PendingPlansCard
          plans={[]}
          onViewPlan={(plan) => {
            if (plan.id !== null) {
              navigate(`/teacher/plans/${plan.id}`);
            } else {
              navigate(`/teacher/courses/${plan.course_subject_id}/plans/${plan.class_number}/new`);
            }
          }}
        />
        <StatsCard
          icon={Bell}
          label='Notificaciones'
          value={unreadCount}
          sublabel={unreadCount > 0 ? 'sin leer' : 'al dia'}
        />
      </div>

      <div className='grid grid-cols-[1fr_320px] gap-6'>
        {/* Left: Course subjects */}
        <div>
          <h2 className='headline-1-bold text-[#10182B] mb-4'>{subjectPluralLabel}</h2>
          {myCourseSubjects.length > 0 ? (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3'>
              {myCourseSubjects.map((cs) => (
                <div
                  key={cs.id}
                  onClick={() => navigate(`/teacher/courses/${cs.id}`)}
                  className='bg-white border border-[#E4E8EF] rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group'
                >
                  <h4 className='text-sm font-medium text-gray-900 group-hover:text-primary transition-colors'>
                    {cs.subject_name}
                  </h4>
                  <p className='text-xs text-gray-500 mt-0.5'>{cs.course_name}</p>
                  <p className='text-xs text-gray-400 mt-1'>Ciclo {cs.school_year}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12 activity-card-bg rounded-2xl'>
              <BookOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='headline-1-bold text-foreground mb-2'>Sin materias asignadas</h3>
              <p className='body-2-regular text-muted-foreground'>
                El coordinador aun no ha asignado materias a tu perfil.
              </p>
            </div>
          )}
        </div>

        {/* Right: Upcoming classes + Notifications */}
        <div className='space-y-6'>
          <UpcomingClassesWidget items={[]} emptyMessage='Disponible pronto' />

          <div>
            <h2 className='headline-1-bold text-[#10182B] mb-4'>Notificaciones</h2>
            <div className='activity-card-bg rounded-2xl p-4'>
              <NotificationList notifications={notifications} onMarkAsRead={handleMarkAsRead} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
