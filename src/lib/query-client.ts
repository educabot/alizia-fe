import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 min — reference data doesn't change often
        retry: 1,
        refetchOnWindowFocus: false, // opt-in per query later
      },
    },
  });
}
