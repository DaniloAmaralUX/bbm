import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/app/contexts/theme-provider'
import { queryClient } from './query-client'

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
