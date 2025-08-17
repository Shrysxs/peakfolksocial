import React, { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function withQueryClient(ui: React.ReactElement, client?: QueryClient) {
  const qc = client ?? createTestQueryClient()
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

export function TestProviders({ children, client }: PropsWithChildren<{ client?: QueryClient }>) {
  const qc = client ?? createTestQueryClient()
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}
