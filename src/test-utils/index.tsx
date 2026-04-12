import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';

/** Creates a QueryClient tuned for tests: no retries, no gc delay. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

function createWrapper({ queryClient, routerProps }: WrapperOptions = {}) {
  const client = queryClient ?? createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

/** Render with QueryClientProvider + MemoryRouter — replaces most test setups. */
export function renderWithProviders(
  ui: ReactElement,
  options?: WrapperOptions & Omit<RenderOptions, 'wrapper'>,
): ReturnType<typeof render> & { queryClient: QueryClient } {
  const queryClient = options?.queryClient ?? createTestQueryClient();
  const result = render(ui, {
    ...options,
    wrapper: createWrapper({ queryClient, routerProps: options?.routerProps }),
  });
  return { ...result, queryClient };
}
