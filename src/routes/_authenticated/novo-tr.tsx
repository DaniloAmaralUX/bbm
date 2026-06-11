import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TRWizardPage } from '@/features/tr'

export const Route = createFileRoute('/_authenticated/novo-tr')({
  validateSearch: z.object({
    duplicate: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { duplicate } = Route.useSearch()
  return <TRWizardPage duplicateFrom={duplicate} />
}
