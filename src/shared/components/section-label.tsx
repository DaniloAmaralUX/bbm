import { cn } from '@/shared/lib/utils'

type SectionLabelProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Editorial section label — UPPERCASE tracking-wide muted.
 *
 * Padrão visual usado em headers de cards, metadados inline, KPI hero,
 * stepper "Etapas", TOC "Sumário". Tamanho fixo `text-xs` (12px) para
 * cohesion entre todas as telas.
 */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  )
}
