import { createFileRoute } from '@tanstack/react-router'
import { TRDashboard } from '@/features/tr'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: TRDashboard,
})
