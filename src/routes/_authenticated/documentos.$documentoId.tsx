import z from 'zod'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { TRViewPage } from '@/features/documents'
import { getTRById } from '@/features/documents/data/tr-document'

function TRViewRouteComponent() {
  const { documentoId } = Route.useParams()
  const { mode } = Route.useSearch()

  return <TRViewPage trId={documentoId} mode={mode} />
}

export const Route = createFileRoute('/_authenticated/documentos/$documentoId')(
  {
    validateSearch: z.object({
      mode: z.enum(['view', 'edit']).optional().catch('view'),
    }),
    // 404 honesto: id inexistente cai no notFoundComponent, em vez de mostrar
    // silenciosamente outro documento.
    loader: ({ params }) => {
      if (!getTRById(params.documentoId)) throw notFound()
    },
    component: TRViewRouteComponent,
  }
)
