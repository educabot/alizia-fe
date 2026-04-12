import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonPlansApi } from '@/services/api';
import type { LessonPlanCreate, GenerateActivityRequest } from '@/types';

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

export function useCreateLessonPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LessonPlanCreate) => lessonPlansApi.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: teachingKeys.lessonPlans(result.course_subject_id) });
    },
  });
}

export function useUpdateLessonPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LessonPlanCreate> }) => lessonPlansApi.update(id, data),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: teachingKeys.lessonPlan(id) });
      queryClient.invalidateQueries({ queryKey: teachingKeys.lessonPlans(result.course_subject_id) });
    },
  });
}

export function useUpdateLessonPlanStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => lessonPlansApi.updateStatus(id, status),
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: teachingKeys.lessonPlan(id) });
      queryClient.invalidateQueries({ queryKey: teachingKeys.lessonPlans(result.course_subject_id) });
    },
  });
}

export function useGenerateActivityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GenerateActivityRequest }) =>
      lessonPlansApi.generateActivity(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: teachingKeys.lessonPlan(id) });
    },
  });
}
