import { useQuery } from '@tanstack/react-query';
import { areasApi, coursesApi, subjectsApi, topicsApi, courseSubjectsApi, activitiesApi } from '@/services/api';
import type { Activity } from '@/types';

export const referenceKeys = {
  areas: ['areas'] as const,
  courses: ['courses'] as const,
  subjects: ['subjects'] as const,
  topics: ['topics'] as const,
  courseSubjects: ['courseSubjects'] as const,
  activitiesByMoment: ['activitiesByMoment'] as const,
  fonts: ['fonts'] as const,
};

export function useAreasQuery() {
  return useQuery({
    queryKey: referenceKeys.areas,
    queryFn: async () => (await areasApi.list()).items,
  });
}

export function useCoursesQuery() {
  return useQuery({
    queryKey: referenceKeys.courses,
    queryFn: async () => (await coursesApi.list()).items,
  });
}

export function useSubjectsQuery() {
  return useQuery({
    queryKey: referenceKeys.subjects,
    queryFn: async () => (await subjectsApi.list()).items,
  });
}

export function useTopicsQuery() {
  return useQuery({
    queryKey: referenceKeys.topics,
    queryFn: async () => (await topicsApi.getTree()).items,
  });
}

export function useCourseSubjectsQuery() {
  return useQuery({
    queryKey: referenceKeys.courseSubjects,
    queryFn: async () => (await courseSubjectsApi.list()).items,
  });
}

export function useActivitiesByMomentQuery() {
  return useQuery({
    queryKey: referenceKeys.activitiesByMoment,
    queryFn: async () => {
      const [apertura, desarrollo, cierre] = await Promise.all([
        activitiesApi.list({ moment: 'apertura' }),
        activitiesApi.list({ moment: 'desarrollo' }),
        activitiesApi.list({ moment: 'cierre' }),
      ]);
      return {
        apertura: apertura.items as Activity[],
        desarrollo: desarrollo.items as Activity[],
        cierre: cierre.items as Activity[],
      };
    },
  });
}

export function useFontsQuery() {
  return useQuery({
    queryKey: referenceKeys.fonts,
    queryFn: async () => {
      // Fonts are currently seeded by App.tsx bootstrap / mocks.
      // A proper queryFn will be added when the font listing endpoint
      // no longer requires a mandatory area_id filter.
      return [] as import('@/types').Font[];
    },
  });
}
