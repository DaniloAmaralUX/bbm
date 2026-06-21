import { CheckCircle2, Link2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import {
  docTypeFullLabel,
  docTypeLabel,
} from '@/features/documents/data/doc-type'
import { type ChainFunnel } from '@/features/documents/data/metrics'

type TRChainHeroProps = {
  funnel: ChainFunnel
}

const rateFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

/**
 * Herói do dashboard: abre com a TESE do produto — a cadeia DFD -> ETP -> TR e a
 * herança fluindo por ela. Espelha a linguagem-assinatura da view (nós + elo
 * Link2 + acento verde), agora no nível agregado: para cada etapa, quantas
 * cadeias a concluíram (dados do funil, RF-14), com a taxa de conclusão em
 * destaque. É o "elemento-assinatura" trazido para a primeira coisa que se vê.
 */
export function TRChainHero({ funnel }: TRChainHeroProps) {
  const { totalChains, stages, completedChains, rate } = funnel

  return (
    <Card className='rounded-2xl border-0 shadow-border'>
      <CardContent className='flex flex-col gap-6 p-6 lg:p-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <div className='text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
              Cadeia da fase preparatória
            </div>
            <h2 className='max-w-xl text-xl font-semibold tracking-tight text-balance'>
              Cada contratação percorre DFD, ETP e TR, herdando o que já foi
              preenchido na etapa anterior.
            </h2>
          </div>
          <div className='shrink-0 sm:text-right'>
            <div className='text-4xl leading-none font-semibold text-primary tabular-nums'>
              {rateFormatter.format(rate)}
            </div>
            <div className='mt-1 text-xs text-muted-foreground'>
              {completedChains} de {totalChains} cadeias concluídas
            </div>
          </div>
        </div>

        <ol className='flex flex-col gap-3 sm:flex-row sm:items-stretch'>
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1
            const width =
              totalChains === 0
                ? 0
                : Math.round((stage.count / totalChains) * 100)
            return (
              <li
                key={stage.docType}
                className='flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center'
              >
                <div className='min-h-11 w-full rounded-2xl border border-primary/30 bg-card px-4 py-3'>
                  <div className='flex items-baseline justify-between gap-2'>
                    <span
                      translate='no'
                      className='text-sm font-semibold tracking-tight'
                    >
                      {docTypeLabel(stage.docType)}
                    </span>
                    <span className='text-2xl font-semibold tabular-nums'>
                      {stage.count}
                    </span>
                  </div>
                  <div
                    className='mt-2 h-1.5 overflow-hidden rounded-full bg-muted'
                    role='presentation'
                  >
                    <div
                      className='h-full rounded-full bg-primary'
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className='mt-1.5 flex items-center gap-1 text-xs text-muted-foreground'>
                    <CheckCircle2
                      aria-hidden='true'
                      className='size-3 text-primary'
                    />
                    {docTypeFullLabel(stage.docType)}
                  </span>
                </div>
                {!isLast ? (
                  <span
                    aria-hidden='true'
                    title='Herança'
                    className='mx-auto flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0'
                  >
                    <Link2 className='size-3.5' />
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>

        <p className='sr-only'>
          {`De ${totalChains} cadeias, ${stages
            .map(
              (stage) =>
                `${stage.count} concluíram o ${docTypeLabel(stage.docType)}`
            )
            .join(
              '; '
            )}. Taxa de conclusão da cadeia ${rateFormatter.format(rate)}.`}
        </p>
      </CardContent>
    </Card>
  )
}
