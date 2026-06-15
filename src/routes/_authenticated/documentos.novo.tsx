import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { RoleGuard } from '@/shared/components/role-guard'
import { TRWizardPage } from '@/features/documents'

export const Route = createFileRoute('/_authenticated/documentos/novo')({
  validateSearch: z.object({
    duplicate: z.string().optional().catch(undefined),
    parentId: z.string().optional().catch(undefined),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { duplicate, parentId } = Route.useSearch()
  return (
    <RoleGuard allow='requisitante'>
      <TRWizardPage duplicateFrom={duplicate} parentId={parentId} />
    </RoleGuard>
  )
}
