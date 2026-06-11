import { cn } from '@/shared/lib/utils'

export type TRMetaItem = {
  label: string
  value?: string
  valueNode?: React.ReactNode
}

type TRMetaListProps = {
  items: TRMetaItem[]
  className?: string
}

/**
 * Description list semântica (<dl>) usada como single source of truth
 * para painéis de metadados do TR — wizard side panel, /tr/$id metadata,
 * cards de revisão, etc. Cada item vira <dt>/<dd>.
 *
 * Aceita `value` (string) ou `valueNode` (React node) — use valueNode
 * quando precisar de inline elements como translate="no" ou ícones.
 */
export function TRMetaList({ items, className }: TRMetaListProps) {
  return (
    <dl className={cn('space-y-4', className)}>
      {items.map((item) => (
        <div key={item.label} className='min-w-0 space-y-1'>
          <dt className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
            {item.label}
          </dt>
          <dd className='font-medium break-words'>
            {item.valueNode ?? item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
