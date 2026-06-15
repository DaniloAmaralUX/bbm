import { createFileRoute } from '@tanstack/react-router'
import { ModelBuilderPage } from '@/features/models/model-builder'

function ModelBuilderRoute() {
  const { modelId } = Route.useParams()
  return <ModelBuilderPage modelId={modelId} />
}

export const Route = createFileRoute('/_authenticated/modelos/$modelId')({
  component: ModelBuilderRoute,
})
