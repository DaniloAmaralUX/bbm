import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TRWizardPage } from '@/features/documents'

export const Route = createFileRoute('/_authenticated/documentos/novo')({
  validateSearch: z.object({
    duplicate: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { duplicate } = Route.useSearch()
  return <TRWizardPage duplicateFrom={duplicate} />
}
