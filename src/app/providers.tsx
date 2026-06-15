import { QueryClientProvider } from '@tanstack/react-query'
import { RoleProvider } from '@/app/contexts/role-provider'
import { ThemeProvider } from '@/app/contexts/theme-provider'
import { queryClient } from './query-client'

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RoleProvider>{children}</RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
