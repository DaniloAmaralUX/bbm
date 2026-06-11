import { createFileRoute } from '@tanstack/react-router'
import { TRDashboard } from '@/features/documents'

export const Route = createFileRoute('/_authenticated/')({
  component: TRDashboard,
})
