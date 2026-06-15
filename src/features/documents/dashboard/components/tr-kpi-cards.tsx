import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

type KPIItem = {
  label: string
  value: number | string
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
    period: string
  }
}

type TRKpiCardsProps = {
  items: KPIItem[]
}

/**
 * Hero KPI card — métricas inline separadas por divisores verticais,
 * estilo editorial (rótulos uppercase, números grandes tabulares).
 * Substitui a antiga grade de N cards individuais para ganhar densidade
 * e dar uma "âncora" visual no topo do dashboard.
 */
export function TRKpiCards({ items }: TRKpiCardsProps) {
  return (
    <Card className='rounded-2xl border-0 shadow-border'>
      <CardContent className='grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border'>
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={cn('space-y-2', idx > 0 && 'lg:pl-6')}
          >
            <div className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
              {item.label}
            </div>
            <div className='text-4xl leading-none font-semibold tabular-nums'>
              {item.value}
            </div>
            {item.trend ? (
              <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs'>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium tabular-nums',
                    item.trend.direction === 'up'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {item.trend.direction === 'up' ? (
                    <TrendingUp aria-hidden='true' className='size-3' />
                  ) : (
                    <TrendingDown aria-hidden='true' className='size-3' />
                  )}
                  {item.trend.direction === 'up' ? '+' : '−'}
                  {item.trend.value}%
                </span>
                <span className='text-muted-foreground'>
                  {item.trend.period}
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function TRKpiCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Card
      aria-busy='true'
      aria-label='Carregando indicadores'
      className='rounded-2xl border-0 shadow-border'
    >
      <CardContent className='grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border'>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={cn('space-y-2', idx > 0 && 'lg:pl-6')}>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-9 w-16' />
            <Skeleton className='h-3 w-32' />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
