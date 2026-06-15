import { Link2, Pencil, FileText } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  type DocType,
  docTypeLabel,
} from '@/features/documents/data/doc-type'
import {
  type DocumentCells,
  type FieldOrigin,
} from '@/features/documents/data/inheritance'
import { getModelForDocType } from '@/features/documents/data/templates'

type LineageRow = {
  fieldId: string
  label: string
  origin: FieldOrigin
  inheritedFrom?: DocType
}

/**
 * Painel de linhagem co-locado ao formulario: lista cada campo do documento
 * atual e sua origem (herdado de X / ajustado / proprio do tipo), com legenda.
 * Reduz recall ao deixar a proveniencia visivel ao lado da edicao.
 */
export function TRLineagePanel({
  docType,
  cells,
}: {
  docType: DocType
  cells: DocumentCells
}) {
  const model = getModelForDocType(docType)
  const rows: LineageRow[] = []
  const seen = new Set<string>()

  for (const section of model.sections) {
    if (section.kind !== 'fields') continue
    for (const fieldId of section.fieldIds ?? []) {
      if (seen.has(fieldId)) continue
      seen.add(fieldId)
      const field = model.fields[fieldId]
      const cell = cells[fieldId]
      if (!field || !cell) continue
      rows.push({
        fieldId,
        label: field.label,
        origin: cell.origin,
        inheritedFrom: cell.inheritedFrom,
      })
    }
  }

  return (
    <Card className='rounded-3xl border-0 shadow-border'>
      <CardHeader>
        <CardTitle className='text-base'>Herança</CardTitle>
        <CardDescription>
          De onde vem cada informação deste documento.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <ul className='flex flex-col'>
          {rows.map((row) => (
            <li
              key={row.fieldId}
              className='flex items-start gap-3 border-t border-border py-2.5 first:border-t-0'
            >
              <OriginIcon origin={row.origin} />
              <div className='min-w-0'>
                <p className='text-sm font-medium leading-tight'>{row.label}</p>
                <p className='text-xs text-muted-foreground'>
                  {originDescription(row, docType)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Legend />
      </CardContent>
    </Card>
  )
}

function originDescription(row: LineageRow, docType: DocType): string {
  if (row.origin === 'inherited' && row.inheritedFrom) {
    return `Herdado de ${docTypeLabel(row.inheritedFrom)}`
  }
  if (row.origin === 'adjusted') {
    const from = row.inheritedFrom ? docTypeLabel(row.inheritedFrom) : 'cadeia'
    return `Ajustado (origem: ${from})`
  }
  return `Próprio do ${docTypeLabel(docType)}`
}

function OriginIcon({ origin }: { origin: FieldOrigin }) {
  if (origin === 'inherited') {
    return (
      <span
        aria-hidden='true'
        className='mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground'
      >
        <Link2 className='size-3' />
      </span>
    )
  }
  if (origin === 'adjusted') {
    return (
      <span
        aria-hidden='true'
        className='mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
      >
        <Pencil className='size-3' />
      </span>
    )
  }
  return (
    <span
      aria-hidden='true'
      className='mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'
    >
      <FileText className='size-3' />
    </span>
  )
}

function Legend() {
  return (
    <div className='flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground'>
      <LegendItem className='bg-secondary' label='herdado' />
      <LegendItem
        className='bg-amber-100 dark:bg-amber-950/40'
        label='ajustado'
      />
      <LegendItem className='bg-muted' label='próprio' />
    </div>
  )
}

function LegendItem({
  className,
  label,
}: {
  className: string
  label: string
}) {
  return (
    <span className='inline-flex items-center gap-1.5'>
      <span
        aria-hidden='true'
        className={cn('size-3 rounded-[4px] border border-border', className)}
      />
      {label}
    </span>
  )
}
