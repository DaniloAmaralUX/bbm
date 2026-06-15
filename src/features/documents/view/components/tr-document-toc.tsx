import { useCallback, useEffect, useMemo, useState } from 'react'
import { List } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { type DocumentSection } from '@/features/documents/data/templates'

type TRDocumentTocProps = {
  sections: DocumentSection[]
  containerSelector?: string
}

export function slugifySection(title: string): string {
  return `section-${title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
}

function filterValid(sections: DocumentSection[]): DocumentSection[] {
  return sections.filter((section) => {
    if (section.kind === 'prose') return section.content.trim().length > 0
    if (section.kind === 'keyValue') return section.items.length > 0
    return section.rows.length > 0 || Boolean(section.emptyMessage)
  })
}

function useActiveSection(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (ids.length === 0) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target.getBoundingClientRect().top ?? 0) -
              (b.target.getBoundingClientRect().top ?? 0)
          )
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.5, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

function TocList({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; title: string }[]
  activeId: string | null
  onSelect?: (id: string) => void
}) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault()
      const el = document.getElementById(id)
      if (!el) return
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      el.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      })
      onSelect?.(id)
    },
    [onSelect]
  )

  if (items.length === 0) {
    return (
      <p className='px-2 py-3 text-xs text-muted-foreground'>
        Documento sem seções para indexar ainda.
      </p>
    )
  }

  return (
    <ol className='space-y-0.5'>
      {items.map((item, index) => {
        const isActive = item.id === activeId
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => handleClick(event, item.id)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex items-start gap-2 rounded-lg border-l-2 border-transparent px-3 py-1.5 text-xs leading-relaxed transition-[background-color,border-color,color] duration-200 ease-[var(--ease-emil-out)]',
                'hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                isActive &&
                  'border-l-primary bg-primary/5 font-semibold text-primary'
              )}
            >
              <span className='shrink-0 text-muted-foreground tabular-nums'>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className='line-clamp-2'>{item.title}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

export function TRDocumentToc({ sections }: TRDocumentTocProps) {
  const items = useMemo(
    () =>
      filterValid(sections).map((section) => ({
        id: slugifySection(section.title),
        title: section.title,
      })),
    [sections]
  )
  const ids = useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveSection(ids)
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* Sticky rail (>= xl) */}
      <nav
        aria-label='Sumário do documento'
        className='hidden xl:sticky xl:top-20 xl:block xl:self-start'
      >
        <div className='space-y-2 rounded-2xl border-0 bg-card p-3 shadow-border'>
          <div className='px-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
            Sumário
          </div>
          <TocList items={items} activeId={activeId} />
        </div>
      </nav>

      {/* Floating trigger + Sheet (< xl) */}
      <div className='fixed right-4 bottom-20 z-30 xl:hidden'>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='gap-2 rounded-full bg-background shadow-lg'
              aria-label='Abrir sumário do documento'
            >
              <List aria-hidden='true' className='size-4' />
              Sumário
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-80 sm:w-96'>
            <SheetHeader>
              <SheetTitle>Sumário do documento</SheetTitle>
              <SheetDescription>
                Toque em uma seção para pular direto pra ela.
              </SheetDescription>
            </SheetHeader>
            <div className='mt-4 px-4 pb-6'>
              <TocList
                items={items}
                activeId={activeId}
                onSelect={() => setSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
