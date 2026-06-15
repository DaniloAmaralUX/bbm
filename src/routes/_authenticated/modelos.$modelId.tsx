import { createFileRoute } from '@tanstack/react-router'
import { RoleGuard } from '@/shared/components/role-guard'
import { ModelBuilderPage } from '@/features/models/model-builder'

function ModelBuilderRoute() {
  const { modelId } = Route.useParams()
  return (
    <RoleGuard allow='sustentacao'>
      <ModelBuilderPage modelId={modelId} />
    </RoleGuard>
  )
}

export const Route = createFileRoute('/_authenticated/modelos/$modelId')({
  component: ModelBuilderRoute,
})
