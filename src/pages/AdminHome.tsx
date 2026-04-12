import { Link } from 'react-router-dom';
import { Layers, BookOpen, GraduationCap, Network, ListChecks } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAreasQuery, useCoursesQuery, useSubjectsQuery, useTopicsQuery } from '@/hooks/queries/useReferenceQueries';

/**
 * Landing page para usuarios con rol `admin`.
 *
 * Hasta este commit, los usuarios admin que entraban a `/` terminaban en
 * `<Navigate to="/login" replace />` porque el switch de `userRole` en
 * `App.tsx` solo contemplaba coordinator/teacher. Con el CRUD de Areas
 * (unica entidad con endpoints de update/delete en el backend), este home
 * sirve como indice de las pantallas administrativas disponibles.
 *
 * Las otras entidades (Subjects, Courses, Topics, Activities) estan
 * representadas como cards deshabilitadas para comunicar el scope: la UI
 * las conocera cuando el backend exponga endpoints de edicion.
 */

interface AdminSection {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  /** Si es false, se renderiza como card deshabilitada (endpoint no existe). */
  available: boolean;
  /** Contador opcional para mostrar cantidad actual de registros. */
  count?: number;
}

export function AdminHome() {
  const user = useAuthStore((s) => s.user);
  const { data: areas = [] } = useAreasQuery();
  const { data: subjects = [] } = useSubjectsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { data: topics = [] } = useTopicsQuery();

  const firstName = user?.name.split(' ')[0] || '';

  const sections: AdminSection[] = [
    {
      to: '/admin/areas',
      icon: Layers,
      label: 'Areas',
      description: 'Gestiona las areas de conocimiento de tu organizacion.',
      available: true,
      count: areas.length,
    },
    {
      to: '/admin/subjects',
      icon: BookOpen,
      label: 'Asignaturas',
      description: 'Proximamente — el backend aun no soporta editar asignaturas.',
      available: false,
      count: subjects.length,
    },
    {
      to: '/admin/courses',
      icon: GraduationCap,
      label: 'Cursos',
      description: 'Proximamente — el backend aun no soporta editar cursos.',
      available: false,
      count: courses.length,
    },
    {
      to: '/admin/topics',
      icon: Network,
      label: 'Temas',
      description: 'Proximamente — el backend aun no soporta editar temas.',
      available: false,
      count: topics.length,
    },
    {
      to: '/admin/activities',
      icon: ListChecks,
      label: 'Actividades',
      description: 'Proximamente — el backend aun no soporta editar actividades.',
      available: false,
    },
  ];

  return (
    <div className='max-w-5xl mx-auto px-6 py-8'>
      <div className='mb-8'>
        <h1 className='title-2-emphasized text-[#10182B]'>Hola {firstName},</h1>
        <p className='body-2-regular text-muted-foreground mt-1'>
          Administra los datos de referencia de tu organizacion.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {sections.map((section) => (
          <AdminSectionCard key={section.to} section={section} />
        ))}
      </div>
    </div>
  );
}

function AdminSectionCard({ section }: { section: AdminSection }) {
  const Icon = section.icon;
  const card = (
    <div
      className={`activity-card-bg rounded-2xl p-6 h-full transition-all ${
        section.available ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-not-allowed opacity-60'
      }`}
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
          <Icon className='w-5 h-5 text-primary' />
        </div>
        {section.count !== undefined && <span className='headline-1-bold text-[#10182B]'>{section.count}</span>}
      </div>
      <h3 className='headline-1-bold text-[#10182B] mb-1'>{section.label}</h3>
      <p className='body-2-regular text-muted-foreground'>{section.description}</p>
    </div>
  );

  if (section.available) {
    return (
      <Link to={section.to} aria-label={`Ir a ${section.label}`}>
        {card}
      </Link>
    );
  }
  return <div aria-disabled='true'>{card}</div>;
}
