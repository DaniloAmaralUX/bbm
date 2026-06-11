import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FilePlus, Files, LayoutDashboard, Search } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/shared/ui/command'
import { trs } from '@/features/documents/data/trs'

type NavItem = {
  label: string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  to: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Documentos', hint: 'lista', icon: Files, to: '/documentos' },
  { label: 'Novo documento', icon: FilePlus, to: '/documentos/novo' },
]

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const go = (to: string) => {
    setOpen(false)
    void navigate({ to })
  }

  const goToTR = (trId: string) => {
    setOpen(false)
    void navigate({ to: '/documentos/$documentoId', params: { documentoId: trId } })
  }

  const recentTRs = trs.slice(0, 6)

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => setOpen(true)}
        className='h-9 w-full max-w-xs justify-start gap-2 rounded-xl bg-muted/50 text-sm font-normal text-muted-foreground hover:bg-muted/70'
      >
        <Search aria-hidden='true' className='size-4' />
        <span className='flex-1 text-start'>Buscar documento ou ação…</span>
        <kbd className='hidden h-5 items-center gap-1 rounded border bg-background px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Buscar documento, página ou ação…' />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          <CommandGroup heading='Navegação'>
            {navItems.map((item) => (
              <CommandItem
                key={item.to}
                value={`${item.label} ${item.hint ?? ''}`}
                onSelect={() => go(item.to)}
              >
                <item.icon aria-hidden='true' className='size-4' />
                <span>{item.label}</span>
                {item.to === '/dashboard' ? (
                  <CommandShortcut>G H</CommandShortcut>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading='Documentos recentes'>
            {recentTRs.map((tr) => (
              <CommandItem
                key={tr.id}
                value={`${tr.id} ${tr.title}`}
                onSelect={() => goToTR(tr.id)}
              >
                <Files aria-hidden='true' className='size-4' />
                <div className='flex min-w-0 flex-col'>
                  <span className='truncate text-sm'>{tr.title}</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    <span className='font-mono'>{tr.id}</span> · {tr.unit}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
