import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coordinationDocumentsApi } from '@/services/api';
import type { CoordinationDocumentCreate, CoordinationDocumentUpdate, GenerateRequest } from '@/types';

export const coordinationKeys = {
  all: ['coordinationDocuments'] as const,
  detail: (id: number) => ['coordinationDocuments', id] as const,
};

export function useCoordinationDocumentsQuery() {
  return useQuery({
    queryKey: coordinationKeys.all,
    queryFn: async () => (await coordinationDocumentsApi.list()).items,
  });
}

export function useCoordinationDocumentQuery(id: number) {
  return useQuery({
    queryKey: coordinationKeys.detail(id),
    queryFn: () => coordinationDocumentsApi.getById(id),
    enabled: id > 0,
  });
}

export function useCreateDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CoordinationDocumentCreate) => coordinationDocumentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinationKeys.all });
    },
  });
}

export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CoordinationDocumentUpdate }) =>
      coordinationDocumentsApi.update(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: coordinationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: coordinationKeys.all });
    },
  });
}

export function useGenerateDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: GenerateRequest }) =>
      coordinationDocumentsApi.generate(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: coordinationKeys.detail(id) });
    },
  });
}
