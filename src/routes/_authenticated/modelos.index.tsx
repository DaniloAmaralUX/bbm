import { createFileRoute } from '@tanstack/react-router'
import { RoleGuard } from '@/shared/components/role-guard'
import { ModelsListPage } from '@/features/models'

function ModelsRoute() {
  return (
    <RoleGuard allow='sustentacao'>
      <ModelsListPage />
    </RoleGuard>
  )
}

export const Route = createFileRoute('/_authenticated/modelos/')({
  component: ModelsRoute,
})
