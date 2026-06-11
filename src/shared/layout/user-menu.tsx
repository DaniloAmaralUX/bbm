import {
  ChevronsUpDown,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/app/contexts/theme-provider'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar'

type UserMenuProps = {
  name?: string
  email?: string
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function UserMenu({
  name = 'Ana Ribeiro',
  email = 'ana.ribeiro@exemplo.gov.br',
}: UserMenuProps) {
  const { theme, setTheme } = useTheme()
  const { isMobile } = useSidebar()
  const initials = getInitials(name)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='size-8 rounded-lg'>
                <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {email}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
            className='w-56 rounded-lg'
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                <Avatar className='size-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{name}</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircle aria-hidden='true' />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings aria-hidden='true' />
                Configurações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === 'dark' ? (
                  <Moon aria-hidden='true' />
                ) : theme === 'light' ? (
                  <Sun aria-hidden='true' />
                ) : (
                  <Monitor aria-hidden='true' />
                )}
                Tema
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as 'light' | 'dark' | 'system')
                  }
                >
                  <DropdownMenuRadioItem value='light'>
                    <Sun aria-hidden='true' className='me-2 size-4' />
                    Claro
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='dark'>
                    <Moon aria-hidden='true' className='me-2 size-4' />
                    Escuro
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='system'>
                    <Monitor aria-hidden='true' className='me-2 size-4' />
                    Sistema
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info('Sessão encerrada (mock).')}
            >
              <LogOut aria-hidden='true' />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
