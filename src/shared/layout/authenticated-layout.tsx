import { Outlet } from '@tanstack/react-router'
import { LayoutProvider } from '@/app/contexts/layout-provider'
import { getCookie } from '@/shared/lib/cookies'
import { cn } from '@/shared/lib/utils'
import { AppSidebar } from '@/shared/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import { SkipToMain } from '@/shared/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  return (
    <LayoutProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <SidebarInset
          className={cn(
            '@container/content',
            'has-data-[layout=fixed]:h-svh',
            'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
          )}
        >
          {children ?? <Outlet />}
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}
