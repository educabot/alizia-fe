import { useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonPlansApi } from '@/services/api';

export const teachingKeys = {
  lessonPlans: (courseSubjectId: number) => ['lessonPlans', courseSubjectId] as const,
  lessonPlan: (id: number) => ['lessonPlan', id] as const,
};

export function useLessonPlansQuery(courseSubjectId: number) {
  return useQuery({
    queryKey: teachingKeys.lessonPlans(courseSubjectId),
    queryFn: async () => (await lessonPlansApi.listByCourseSubject(courseSubjectId)).items,
    enabled: courseSubjectId > 0,
  });
}

export function useLessonPlanQuery(id: number) {
  return useQuery({
    queryKey: teachingKeys.lessonPlan(id),
    queryFn: () => lessonPlansApi.getById(id),
    enabled: id > 0,
  });
}
