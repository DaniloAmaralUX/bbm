import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TRViewPage } from '@/features/tr'

function TRViewRouteComponent() {
  const { trId } = Route.useParams()
  const { mode } = Route.useSearch()

  return <TRViewPage trId={trId} mode={mode} />
}

export const Route = createFileRoute('/_authenticated/tr/$trId')({
  validateSearch: z.object({
    mode: z.enum(['view', 'edit']).optional().catch('view'),
  }),
  component: TRViewRouteComponent,
})
