import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http.ts'

/** Server data lives only in this cache, never in a store of our own (AD-23). */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // A 4xx will not change by asking again; a network error or 5xx may.
        retry: (failures, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failures < 2,
        staleTime: 30_000,
      },
    },
  })
}

export const queryClient = createQueryClient()
