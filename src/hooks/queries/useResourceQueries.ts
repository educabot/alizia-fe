import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesApi, resourceTypesApi } from '@/services/api';
import type { ResourceCreate } from '@/types';

export const resourceKeys = {
  all: ['resources'] as const,
  detail: (id: number) => ['resources', id] as const,
  types: ['resourceTypes'] as const,
};

export function useResourcesQuery() {
  return useQuery({
    queryKey: resourceKeys.all,
    queryFn: async () => (await resourcesApi.list()).items,
  });
}

export function useResourceQuery(id: number) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => resourcesApi.getById(id),
    enabled: id > 0,
  });
}

export function useResourceTypesQuery() {
  return useQuery({
    queryKey: resourceKeys.types,
    queryFn: async () => (await resourceTypesApi.list()).items,
  });
}

export function useCreateResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResourceCreate) => resourcesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}

export function useDeleteResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => resourcesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}

export function useGenerateContentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customInstruction }: { id: number; customInstruction?: string }) =>
      resourcesApi.generate(id, customInstruction ? { custom_instruction: customInstruction } : undefined),
    onSuccess: async (_, { id }) => {
      // Refetch the individual resource to get updated content
      await queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) });
    },
  });
}
