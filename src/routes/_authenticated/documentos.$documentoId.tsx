import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TRViewPage } from '@/features/documents'

function TRViewRouteComponent() {
  const { documentoId } = Route.useParams()
  const { mode } = Route.useSearch()

  return <TRViewPage trId={documentoId} mode={mode} />
}

export const Route = createFileRoute('/_authenticated/documentos/$documentoId')({
  validateSearch: z.object({
    mode: z.enum(['view', 'edit']).optional().catch('view'),
  }),
  component: TRViewRouteComponent,
})
