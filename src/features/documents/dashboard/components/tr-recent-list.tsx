import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  type TRStatus,
  trStatusBadgeClass,
  trStatusLabels,
} from '@/features/documents/data/data'

type RecentTR = {
  id: string
  title: string
  unit: string
  owner: string
  status: TRStatus
  updatedAt: string
}

type TRRecentListProps = {
  items: RecentTR[]
}

/**
 * Versão compacta de "Documentos recentes" para uso em rail/sidebar.
 * Cada item é um link clicável que leva ao documento.
 */
export function TRRecentList({ items }: TRRecentListProps) {
  if (items.length === 0) {
    return (
      <p className='px-2 py-6 text-center text-sm text-muted-foreground'>
        Nenhum documento atualizado recentemente.
      </p>
    )
  }

  return (
    <ul className='space-y-0.5'>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to='/documentos/$documentoId'
            params={{ documentoId: item.id }}
            className='group flex flex-col gap-1.5 rounded-xl border border-transparent px-3 py-2.5 transition-colors duration-200 ease-[var(--ease-emil-out)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none hover-only:hover:border-border hover-only:hover:bg-muted/50'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='font-mono text-[11px] font-medium text-muted-foreground'>
                {item.id}
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'shrink-0 px-1.5 text-[10px]',
                  trStatusBadgeClass[item.status]
                )}
              >
                {trStatusLabels[item.status]}
              </Badge>
            </div>
            <p className='line-clamp-2 text-sm leading-snug text-foreground'>
              {item.title}
            </p>
            <div className='flex items-center justify-between gap-2 text-[11px] text-muted-foreground'>
              <span className='truncate'>
                {item.unit} · {item.owner}
              </span>
              <span className='shrink-0 tabular-nums'>{item.updatedAt}</span>
            </div>
          </Link>
        </li>
      ))}
      <li className='pt-1'>
        <Link
          to='/documentos'
          className='flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none hover-only:hover:bg-muted/50 hover-only:hover:text-foreground'
        >
          Ver todos os documentos
          <ArrowRight aria-hidden='true' className='size-3' />
        </Link>
      </li>
    </ul>
  )
}

export function TRRecentListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul
      aria-busy='true'
      aria-label='Carregando documentos recentes'
      className='space-y-2'
    >
      {Array.from({ length: count }).map((_, idx) => (
        <li key={idx} className='space-y-1.5 px-3 py-2.5'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-3 w-20' />
            <Skeleton className='h-4 w-16 rounded-md' />
          </div>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-3 w-2/3' />
        </li>
      ))}
    </ul>
  )
}
