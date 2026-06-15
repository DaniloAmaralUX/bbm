import { CheckCircle2 } from 'lucide-react'
import { type ChainFunnel } from '@/features/documents/data/metrics'

type TRChainFunnelProps = {
  funnel: ChainFunnel
}

const rateFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

/**
 * Funil de conclusão da cadeia (RF-14): quantas cadeias concluíram cada etapa
 * DFD -> ETP -> TR, com a taxa de conclusão (cadeias que chegaram a um TR
 * aprovado). Barras decrescentes proporcionais ao total de cadeias; acento verde
 * por token, com ícone + rótulo em cada etapa (status nunca por cor sozinha).
 */
export function TRChainFunnel({ funnel }: TRChainFunnelProps) {
  const { totalChains, stages, completedChains, rate } = funnel

  return (
    <div className='space-y-5'>
      <div className='flex items-end justify-between gap-3'>
        <div className='space-y-1'>
          <div className='text-4xl leading-none font-semibold tabular-nums'>
            {completedChains}
          </div>
          <div className='text-xs text-muted-foreground'>
            de {totalChains} cadeias concluídas
          </div>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-semibold text-primary tabular-nums'>
            {rateFormatter.format(rate)}
          </div>
          <div className='text-xs text-muted-foreground'>das cadeias</div>
        </div>
      </div>

      <ol className='space-y-3'>
        {stages.map((stage) => {
          const width =
            totalChains === 0
              ? 0
              : Math.round((stage.count / totalChains) * 100)
          return (
            <li key={stage.docType} className='space-y-1.5'>
              <div className='flex items-center justify-between gap-2 text-sm'>
                <span className='flex items-center gap-1.5 font-medium'>
                  <CheckCircle2
                    aria-hidden='true'
                    className='size-3.5 text-primary'
                  />
                  {stage.label}
                </span>
                <span className='text-muted-foreground tabular-nums'>
                  {stage.count}
                </span>
              </div>
              <div
                className='h-2 overflow-hidden rounded-full bg-muted'
                role='presentation'
              >
                <div
                  className='h-full rounded-full bg-primary'
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          )
        })}
      </ol>

      <p className='sr-only'>
        {`De ${totalChains} cadeias, ${stages
          .map((stage) => `${stage.label}: ${stage.count}`)
          .join('; ')}. Taxa de conclusão ${rateFormatter.format(rate)}.`}
      </p>
    </div>
  )
}
