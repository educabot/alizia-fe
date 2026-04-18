import { useState } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, UserPlus, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesApi, courseSubjectsApi } from '@/services/api';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { referenceKeys, useSubjectsQuery } from '@/hooks/queries/useReferenceQueries';
import { showApiError, toastSuccess } from '@/lib/toast';
import { DataState } from '@/components/DataState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Course, DayOfWeek } from '@/types';

const DAY_LABEL: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miercoles',
  thursday: 'Jueves',
  friday: 'Viernes',
};

// BE espera day_of_week como number (1=lunes .. 5=viernes) en POST, pero en la
// response devuelve el string. Mantenemos ambos lados alineados aca.
const DAY_TO_NUMBER: Record<DayOfWeek, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
};

const DAY_OPTIONS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export function AdminCourses() {
  const queryClient = useQueryClient();
  const { items, hasMore, loadMore, isLoading, isLoadingMore, error, reload } = usePaginatedList(
    (limit, offset) => coursesApi.list({ limit, offset }),
    {},
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    try {
      await coursesApi.create({ name: trimmed });
      toastSuccess('Curso creado');
      await Promise.all([reload(), queryClient.invalidateQueries({ queryKey: referenceKeys.courses })]);
      setCreateOpen(false);
      setName('');
    } catch (err) {
      showApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-6 py-8'>
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h1 className='title-2-emphasized text-[#10182B]'>Cursos</h1>
          <p className='body-2-regular text-muted-foreground mt-1'>
            Gestiona los cursos y alumnos de tu organizacion.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className='gap-2'>
          <Plus className='w-4 h-4' />
          Nuevo curso
        </Button>
      </div>

      <DataState
        loading={isLoading}
        error={error}
        data={items}
        onRetry={reload}
        emptyState={
          <div className='text-center py-16 activity-card-bg rounded-2xl'>
            <GraduationCap className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='headline-1-bold text-foreground mb-2'>Aun no hay cursos</h3>
            <p className='body-2-regular text-muted-foreground mb-4'>Crea el primer curso.</p>
            <Button onClick={() => setCreateOpen(true)} className='gap-2'>
              <Plus className='w-4 h-4' />
              Nuevo curso
            </Button>
          </div>
        }
      >
        <ul className='space-y-3'>
          {items.map((course) => (
            <li key={course.id} className='activity-card-bg rounded-2xl p-4 flex items-center justify-between gap-4'>
              <button
                type='button'
                onClick={() => setDetailCourse(course)}
                className='flex-1 text-left min-w-0 flex items-center gap-3 group'
              >
                <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                  <GraduationCap className='w-5 h-5 text-primary' />
                </div>
                <div className='min-w-0'>
                  <h3 className='headline-1-bold text-[#10182B] group-hover:text-primary truncate'>{course.name}</h3>
                  <p className='text-xs text-muted-foreground'>Ver detalle, alumnos y asignaciones</p>
                </div>
                <ChevronRight className='w-4 h-4 text-muted-foreground ml-auto shrink-0' />
              </button>
              <div className='flex items-center gap-2 shrink-0'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled
                  title='El backend aun no soporta editar cursos'
                  aria-label={`Editar ${course.name} (no disponible)`}
                  className='gap-1'
                >
                  <Pencil className='w-4 h-4' />
                  Editar
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled
                  title='El backend aun no soporta eliminar cursos'
                  aria-label={`Eliminar ${course.name} (no disponible)`}
                  className='gap-1 text-red-600'
                >
                  <Trash2 className='w-4 h-4' />
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {hasMore && (
          <div className='flex justify-center mt-6'>
            <Button variant='outline' onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? 'Cargando...' : 'Cargar mas'}
            </Button>
          </div>
        )}
      </DataState>

      <Dialog open={createOpen} onOpenChange={(open) => !isSubmitting && setCreateOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo curso</DialogTitle>
            <DialogDescription>Crea un curso — luego podras agregar alumnos y asignaciones.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='course-name'>Nombre</Label>
              <Input
                id='course-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Ej: 2do 1era'
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? 'Guardando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {detailCourse && (
        <CourseDetailDialog
          courseId={detailCourse.id}
          courseName={detailCourse.name}
          onClose={() => setDetailCourse(null)}
        />
      )}
    </div>
  );
}

function CourseDetailDialog({
  courseId,
  courseName,
  onClose,
}: {
  courseId: number;
  courseName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', courseId, 'detail'],
    queryFn: () => coursesApi.getById(courseId),
  });

  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) return;
    setIsAddingStudent(true);
    try {
      await coursesApi.addStudent(courseId, { name: trimmed });
      toastSuccess('Alumno agregado');
      await refetch();
      await queryClient.invalidateQueries({ queryKey: referenceKeys.courses });
      setStudentDialogOpen(false);
      setStudentName('');
    } catch (err) {
      showApiError(err);
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleAssignCreated = async () => {
    setAssignOpen(false);
    await Promise.all([
      refetch(),
      queryClient.invalidateQueries({ queryKey: referenceKeys.courses }),
      queryClient.invalidateQueries({ queryKey: referenceKeys.courseSubjects }),
    ]);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{courseName}</DialogTitle>
          <DialogDescription>Detalle del curso.</DialogDescription>
        </DialogHeader>

        <DataState loading={isLoading} error={error} data={course ? [course] : []} onRetry={refetch}>
          {course && (
            <div className='space-y-6 max-h-[60vh] overflow-y-auto pr-2'>
              <section>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='headline-1-bold text-[#10182B]'>Alumnos ({course.students?.length ?? 0})</h3>
                  <Button size='sm' onClick={() => setStudentDialogOpen(true)} className='gap-1'>
                    <UserPlus className='w-4 h-4' />
                    Agregar alumno
                  </Button>
                </div>
                {course.students && course.students.length > 0 ? (
                  <ul className='space-y-2'>
                    {course.students.map((s) => (
                      <li
                        key={s.id}
                        className='bg-white border border-[#E4E8EF] rounded-lg px-3 py-2 body-2-regular text-[#10182B]'
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='body-2-regular text-muted-foreground'>Aun no hay alumnos en este curso.</p>
                )}
              </section>

              <section>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='headline-1-bold text-[#10182B]'>
                    Asignaciones ({course.course_subjects?.length ?? 0})
                  </h3>
                  <Button size='sm' onClick={() => setAssignOpen(true)} className='gap-1'>
                    <BookOpen className='w-4 h-4' />
                    Asignar materia
                  </Button>
                </div>
                {course.course_subjects && course.course_subjects.length > 0 ? (
                  <ul className='space-y-2'>
                    {course.course_subjects.map((cs) => (
                      <li key={cs.id} className='bg-white border border-[#E4E8EF] rounded-lg px-3 py-2'>
                        <p className='body-2-regular text-[#10182B]'>{cs.subject.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          Ciclo {cs.school_year}
                          {cs.teacher ? ` — ${cs.teacher.first_name} ${cs.teacher.last_name}` : ' — sin docente'}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='body-2-regular text-muted-foreground'>Aun no hay asignaciones para este curso.</p>
                )}
              </section>

              <ScheduleSection
                courseId={courseId}
                courseSubjects={course.course_subjects ?? []}
              />
            </div>
          )}
        </DataState>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={studentDialogOpen} onOpenChange={(open) => !isAddingStudent && setStudentDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar alumno</DialogTitle>
            <DialogDescription>Agrega un alumno al curso {courseName}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='student-name'>Nombre completo</Label>
              <Input
                id='student-name'
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder='Ej: Juan Perez'
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setStudentDialogOpen(false)}
                disabled={isAddingStudent}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isAddingStudent || !studentName.trim()}>
                {isAddingStudent ? 'Agregando...' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {assignOpen && (
        <AssignSubjectDialog
          courseId={courseId}
          onClose={() => setAssignOpen(false)}
          onCreated={handleAssignCreated}
        />
      )}
    </Dialog>
  );
}

function AssignSubjectDialog({
  courseId,
  onClose,
  onCreated,
}: {
  courseId: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjectsQuery();
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [schoolYear, setSchoolYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sid = Number(subjectId);
    const tid = Number(teacherId);
    const year = Number(schoolYear);
    if (!sid || !tid || !year) {
      showApiError(new Error('Completa materia, docente y ciclo'));
      return;
    }
    setIsSubmitting(true);
    try {
      await courseSubjectsApi.create({
        course_id: courseId,
        subject_id: sid,
        teacher_id: tid,
        school_year: year,
        start_date: startDate,
        end_date: endDate,
      });
      toastSuccess('Materia asignada');
      onCreated();
    } catch (err) {
      showApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar materia al curso</DialogTitle>
          <DialogDescription>
            Selecciona una materia y un docente. El ID numerico del docente es temporal hasta que el backend exponga el
            listado de usuarios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='assign-subject'>Materia</Label>
            <select
              id='assign-subject'
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
              required
              disabled={subjectsLoading}
            >
              <option value=''>— seleccionar —</option>
              {subjects.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='assign-teacher'>ID del docente</Label>
              <Input
                id='assign-teacher'
                type='number'
                min='1'
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='assign-year'>Ciclo lectivo</Label>
              <Input
                id='assign-year'
                type='number'
                min='2000'
                max='2100'
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                required
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-2'>
              <Label htmlFor='assign-start'>Inicio (opcional)</Label>
              <Input
                id='assign-start'
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='assign-end'>Fin (opcional)</Label>
              <Input id='assign-end' type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Asignar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleSection({
  courseId,
  courseSubjects,
}: {
  courseId: number;
  courseSubjects: { id: number; subject: { name: string } }[];
}) {
  const {
    data: schedule = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', courseId, 'schedule'],
    queryFn: () => coursesApi.getSchedule(courseId),
  });

  const [slotOpen, setSlotOpen] = useState(false);
  const [day, setDay] = useState<DayOfWeek>('monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedCsIds, setSelectedCsIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCs = (id: number) => {
    setSelectedCsIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || selectedCsIds.length === 0) {
      showApiError(new Error('Completa horario y al menos una materia'));
      return;
    }
    setIsSubmitting(true);
    try {
      await coursesApi.createTimeSlot(courseId, {
        day_of_week: DAY_TO_NUMBER[day],
        start_time: startTime,
        end_time: endTime,
        course_subject_ids: selectedCsIds,
      });
      toastSuccess('Horario agregado');
      await refetch();
      setSlotOpen(false);
      setDay('monday');
      setStartTime('');
      setEndTime('');
      setSelectedCsIds([]);
    } catch (err) {
      showApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCreateSlot = courseSubjects.length > 0;

  return (
    <section>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='headline-1-bold text-[#10182B]'>Horarios ({schedule.length})</h3>
        <Button
          size='sm'
          onClick={() => setSlotOpen(true)}
          disabled={!canCreateSlot}
          title={canCreateSlot ? undefined : 'Primero asigna al menos una materia al curso'}
          className='gap-1'
        >
          <Clock className='w-4 h-4' />
          Agregar horario
        </Button>
      </div>
      <DataState loading={isLoading} error={error} data={schedule} onRetry={refetch} emptyState={null}>
        {schedule.length > 0 ? (
          <ul className='space-y-2'>
            {schedule.map((slot) => (
              <li key={slot.id} className='bg-white border border-[#E4E8EF] rounded-lg px-3 py-2'>
                <p className='body-2-regular text-[#10182B]'>
                  {DAY_LABEL[slot.day]} {slot.start_time}–{slot.end_time}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {slot.subjects.map((s) => s.subject_name).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className='body-2-regular text-muted-foreground'>Aun no hay horarios configurados.</p>
        )}
      </DataState>

      <Dialog open={slotOpen} onOpenChange={(open) => !open && !isSubmitting && setSlotOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo horario</DialogTitle>
            <DialogDescription>Configura un bloque semanal para este curso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='slot-day'>Dia</Label>
              <select
                id='slot-day'
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABEL[d]}
                  </option>
                ))}
              </select>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <Label htmlFor='slot-start'>Desde</Label>
                <Input
                  id='slot-start'
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='slot-end'>Hasta</Label>
                <Input
                  id='slot-end'
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label>Materias en este bloque</Label>
              <div className='space-y-1 max-h-40 overflow-y-auto border rounded-md p-2'>
                {courseSubjects.map((cs) => (
                  <label key={cs.id} className='flex items-center gap-2 text-sm cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={selectedCsIds.includes(cs.id)}
                      onChange={() => toggleCs(cs.id)}
                    />
                    {cs.subject.name}
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setSlotOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isSubmitting || selectedCsIds.length === 0}>
                {isSubmitting ? 'Guardando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
