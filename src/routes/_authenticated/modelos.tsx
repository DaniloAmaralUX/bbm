import { createFileRoute } from '@tanstack/react-router'
import { ModelsListPage } from '@/features/models'

export const Route = createFileRoute('/_authenticated/modelos')({
  component: ModelsListPage,
})
