import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { CommandPaletteTrigger } from './command-palette'
import { RouteBreadcrumb } from './route-breadcrumb'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg'
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger variant='outline' className='max-md:scale-125' />
          </TooltipTrigger>
          <TooltipContent side='bottom' className='flex items-center gap-2'>
            <span>Alternar menu lateral</span>
            <kbd className='inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground'>
              Ctrl B
            </kbd>
          </TooltipContent>
        </Tooltip>
        <Separator orientation='vertical' className='h-6' />
        <RouteBreadcrumb />
        <div className='ms-auto flex flex-1 items-center justify-end gap-2'>
          <div className='hidden w-full max-w-xs md:block'>
            <CommandPaletteTrigger />
          </div>
          {children}
        </div>
      </div>
    </header>
  )
}
