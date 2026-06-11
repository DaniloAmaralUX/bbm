import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/shared/assets/logo'
import { cn } from '@/shared/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar'
import { appIdentity } from '@/features/tr/data/app'
import { Button } from '../ui/button'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='gap-0 py-0 hover:bg-transparent active:bg-transparent'
          asChild
        >
          <div>
            <Link
              to='/dashboard'
              onClick={() => setOpenMobile(false)}
              className='flex flex-1 items-center gap-3 text-start'
            >
              <Logo className='size-8 text-primary' />
              <span className='grid text-sm leading-tight' translate='no'>
                <span className='truncate font-bold'>{appIdentity.name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {appIdentity.subtitle}
                </span>
              </span>
            </Link>
            <ToggleSidebar />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function ToggleSidebar({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar='trigger'
      data-slot='sidebar-trigger'
      variant='ghost'
      size='icon'
      className={cn('aspect-square size-8 max-md:scale-125', className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <X className='md:hidden' />
      <Menu className='max-md:hidden' />
      <span className='sr-only'>Alternar barra lateral</span>
    </Button>
  )
}
