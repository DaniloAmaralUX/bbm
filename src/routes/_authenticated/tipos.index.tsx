import { createFileRoute } from '@tanstack/react-router'
import { RoleGuard } from '@/shared/components/role-guard'
import { TiposListPage } from '@/features/tipos'

function TiposRoute() {
  return (
    <RoleGuard allow='sustentacao'>
      <TiposListPage />
    </RoleGuard>
  )
}

export const Route = createFileRoute('/_authenticated/tipos/')({
  component: TiposRoute,
})
