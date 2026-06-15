import { Link } from '@tanstack/react-router'
import { Check, Link2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { trStatusTokens } from '@/features/documents/data/data'
import {
  type DocType,
  docTypeFullLabel,
  docTypeLabel,
  docTypes,
} from '@/features/documents/data/doc-type'
import { type TRItem } from '@/features/documents/data/schema'

/**
 * Linhagem da cadeia no nivel de DOCUMENTO (instancia): mostra DFD -> ETP -> TR
 * com o documento atual destacado, os ancestrais/descendentes ja criados como
 * links e os passos ainda nao iniciados como pendentes. A assinatura verde + o
 * elo (Link2) marcam a heranca fluindo pela cadeia (DESIGN.md: elemento-
 * assinatura). Distinto de tr-lineage-panel.tsx (wizard), que mostra a origem
 * POR CAMPO.
 */
export function TRLineageRail({
  chain,
  currentId,
}: {
  chain: TRItem[]
  currentId: string
}) {
  const rootIsDfd = chain[0]?.docType === 'dfd'

  // Documento avulso (cadeia nao enraizada num DFD): mostra so o proprio no.
  if (!rootIsDfd) {
    const doc = chain[0]
    return (
      <Card className='rounded-2xl border-0 shadow-border'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Cadeia</CardTitle>
          <CardDescription>
            Documento sem vínculo de cadeia registrado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doc ? (
            <LineageNode
              docType={doc.docType}
              doc={doc}
              index={docTypes.indexOf(doc.docType)}
              isCurrent
            />
          ) : null}
        </CardContent>
      </Card>
    )
  }

  const byType = new Map(chain.map((doc) => [doc.docType, doc]))

  return (
    <Card className='rounded-2xl border-0 shadow-border'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>Cadeia</CardTitle>
        <CardDescription>
          Os campos comuns são herdados ao longo da cadeia DFD, ETP e TR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className='flex flex-col gap-3 sm:flex-row sm:items-stretch'>
          {docTypes.map((docType, index) => {
            const doc = byType.get(docType)
            const isLast = index === docTypes.length - 1
            return (
              <li
                key={docType}
                className='flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center'
              >
                <LineageNode
                  docType={docType}
                  doc={doc}
                  index={index}
                  isCurrent={doc?.id === currentId}
                />
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
      </CardContent>
    </Card>
  )
}

function LineageNode({
  docType,
  doc,
  index,
  isCurrent,
}: {
  docType: DocType
  doc?: TRItem
  index: number
  isCurrent: boolean
}) {
  const status = doc ? trStatusTokens[doc.status] : null
  const StatusIcon = status?.icon
  const isApproved = doc?.status === 'approved'

  const node = (
    <div
      aria-current={isCurrent ? 'step' : undefined}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3',
        isCurrent &&
          'border-primary bg-primary/5 shadow-[0_0_0_1px_var(--primary)]',
        doc && !isCurrent && 'border-primary/40',
        !doc && 'border-dashed border-border opacity-70'
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
          isApproved && 'bg-primary text-primary-foreground',
          !isApproved && isCurrent && 'bg-secondary text-secondary-foreground',
          !isApproved && !isCurrent && 'bg-muted text-muted-foreground'
        )}
      >
        {isApproved ? <Check className='size-4' /> : index + 1}
      </span>
      <span className='min-w-0 flex-1'>
        <span
          translate='no'
          className='block text-sm font-semibold tracking-tight'
        >
          {docTypeLabel(docType)}
        </span>
        <span className='block truncate text-xs text-muted-foreground'>
          {doc ? doc.id : docTypeFullLabel(docType)}
        </span>
      </span>
      {status && StatusIcon ? (
        <Badge variant='outline' className={cn('gap-1', status.badgeClass)}>
          <StatusIcon className='size-3' />
          {status.label}
        </Badge>
      ) : (
        <Badge variant='outline' className='gap-1 text-muted-foreground'>
          Pendente
        </Badge>
      )}
      <span className='sr-only'>
        {isCurrent ? '. Documento atual.' : doc ? '.' : '. Ainda não iniciado.'}
      </span>
    </div>
  )

  if (doc && !isCurrent) {
    return (
      <Link
        to='/documentos/$documentoId'
        params={{ documentoId: doc.id }}
        className='min-w-0 flex-1 rounded-2xl transition-[box-shadow] duration-200 ease-[var(--ease-emil-out)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none'
      >
        {node}
      </Link>
    )
  }

  return <div className='min-w-0 flex-1'>{node}</div>
}
