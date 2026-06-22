import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LayoutTemplate, Search } from 'lucide-react'
import { useRole } from '@/app/contexts/role-provider'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/command'
import { trStatusTokens } from '@/features/documents/data/data'
import { docTypeLabel } from '@/features/documents/data/doc-type'
import { trs } from '@/features/documents/data/trs'
import { useModelsStore } from '@/features/models/store/use-models-store'
import { sidebarData } from './data/sidebar-data'

/** Itens por grupo quando a busca está vazia (estado "recentes"). */
const RECENT_COUNT = 6
/** Teto de resultados por grupo ao buscar — mantém a lista útil em escala. */
const RESULT_LIMIT = 10

/** Normaliza para comparação: sem acento, minúsculo (busca tolerante a diacrítico). */
function norm(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { role } = useRole()
  const models = useModelsStore((state) => state.models)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
        setQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Abre/fecha sempre reabrindo no estado "recentes" (sem efeito de setState).
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setQuery('')
  }

  const go = (to: string) => {
    setOpen(false)
    void navigate({ to })
  }

  const goToDoc = (id: string) => {
    setOpen(false)
    void navigate({
      to: '/documentos/$documentoId',
      params: { documentoId: id },
    })
  }

  const goToModel = (id: string) => {
    setOpen(false)
    void navigate({ to: '/modelos/$modelId', params: { modelId: id } })
  }

  // Filtragem própria (shouldFilter={false} no cmdk): substring previsível e sem
  // acento, em vez do fuzzy padrão que traz subsequências frouxas.
  const nq = norm(query.trim())
  const hasQuery = nq.length > 0
  const matches = (haystack: string) => !hasQuery || norm(haystack).includes(nq)

  // Navegação derivada da MESMA fonte da sidebar, filtrada pelo papel (sem drift).
  const navItems = sidebarData.navGroups
    .flatMap((group) => group.items)
    .filter(
      (item) => Boolean(item.url) && (!item.roles || item.roles.includes(role))
    )
    .filter((item) => matches(`${item.title} ${item.url}`))

  const docItems = (
    hasQuery
      ? trs.filter((tr) =>
          matches(
            `${tr.id} ${tr.title} ${tr.unit} ${tr.owner} ${docTypeLabel(tr.docType)}`
          )
        )
      : trs.slice(0, RECENT_COUNT)
  ).slice(0, RESULT_LIMIT)

  const modelItems =
    role === 'sustentacao'
      ? (hasQuery
          ? models.filter((model) =>
              matches(`${model.name} ${docTypeLabel(model.docType)}`)
            )
          : models.slice(0, RECENT_COUNT)
        ).slice(0, RESULT_LIMIT)
      : []

  const nothing =
    hasQuery &&
    navItems.length === 0 &&
    docItems.length === 0 &&
    modelItems.length === 0

  return (
    <>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => {
          setQuery('')
          setOpen(true)
        }}
        className='h-9 w-full max-w-xs justify-start gap-2 rounded-xl bg-muted/50 text-sm font-normal text-muted-foreground hover:bg-muted/70'
      >
        <Search aria-hidden='true' className='size-4' />
        <span className='flex-1 text-start'>Buscar documento ou ação…</span>
        <kbd className='hidden h-5 items-center gap-1 rounded border bg-background px-1.5 text-[10px] font-medium text-muted-foreground sm:inline-flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        shouldFilter={false}
        title='Buscar'
        description='Busque documentos, modelos e páginas, ou navegue pelo app.'
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder='Buscar documento, modelo, página…'
        />
        <CommandList>
          {nothing ? (
            <div className='py-6 text-center text-sm'>
              <p className='text-muted-foreground'>
                Nenhum resultado para “{query}”.
              </p>
              <button
                type='button'
                onClick={() => go('/documentos')}
                className='mt-2 font-medium text-primary underline-offset-4 hover:underline'
              >
                Ver todos os documentos
              </button>
            </div>
          ) : null}

          {navItems.length ? (
            <CommandGroup heading='Navegação'>
              {navItems.map((item) => {
                const url = item.url
                if (!url) return null
                return (
                  <CommandItem
                    key={url}
                    value={`nav ${item.title} ${url}`}
                    onSelect={() => go(url)}
                  >
                    {item.icon ? <item.icon aria-hidden='true' /> : null}
                    <span>{item.title}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ) : null}

          {docItems.length ? (
            <>
              {navItems.length ? <CommandSeparator /> : null}
              <CommandGroup
                heading={hasQuery ? 'Documentos' : 'Documentos recentes'}
              >
                {docItems.map((tr) => {
                  const status = trStatusTokens[tr.status]
                  const StatusIcon = status.icon
                  return (
                    <CommandItem
                      key={tr.id}
                      value={`doc ${tr.id}`}
                      onSelect={() => goToDoc(tr.id)}
                    >
                      <div className='flex min-w-0 flex-1 flex-col'>
                        <span className='truncate text-sm'>{tr.title}</span>
                        <span className='truncate text-xs text-muted-foreground'>
                          <span translate='no'>{docTypeLabel(tr.docType)}</span>{' '}
                          · <span className='font-mono'>{tr.id}</span> ·{' '}
                          {tr.unit}
                        </span>
                      </div>
                      <Badge
                        variant='outline'
                        className={cn('ms-2 shrink-0 gap-1', status.badgeClass)}
                      >
                        <StatusIcon aria-hidden='true' className='size-3' />
                        {status.label}
                      </Badge>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </>
          ) : null}

          {modelItems.length ? (
            <>
              <CommandSeparator />
              <CommandGroup heading='Modelos'>
                {modelItems.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={`model ${model.id}`}
                    onSelect={() => goToModel(model.id)}
                  >
                    <LayoutTemplate aria-hidden='true' />
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <span className='truncate text-sm'>{model.name}</span>
                      <span className='truncate text-xs text-muted-foreground'>
                        <span translate='no'>
                          {docTypeLabel(model.docType)}
                        </span>{' '}
                        ·{' '}
                        {model.state === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  )
}
