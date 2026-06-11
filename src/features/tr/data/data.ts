import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'

export const trStatuses = [
  {
    label: 'Rascunho',
    value: 'draft' as const,
    icon: Circle,
  },
  {
    label: 'Aprovado',
    value: 'approved' as const,
    icon: CheckCircle2,
  },
] as const

export type TRStatus = (typeof trStatuses)[number]['value']

export type TRStatusTone =
  | 'neutral'
  | 'warning'
  | 'destructive'
  | 'success'
  | 'danger'

export type TRStatusToken = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  badgeClass: string
  chartColor: string
  tone: TRStatusTone
}

/**
 * Single source of truth para tokens de status do TR.
 * Consumido por Badge, pie chart, alerts, recent table.
 */
export const trStatusTokens: Record<TRStatus, TRStatusToken> = {
  draft: {
    label: 'Rascunho',
    icon: Circle,
    badgeClass:
      'border-slate-300/70 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200',
    chartColor: '#94a3b8',
    tone: 'neutral',
  },
  approved: {
    label: 'Aprovado',
    icon: CheckCircle2,
    badgeClass:
      'border-emerald-300/70 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
    chartColor: '#10b981',
    tone: 'success',
  },
}

// Backward-compat aliases (derived from trStatusTokens)
export const trStatusLabels: Record<string, string> = Object.fromEntries(
  Object.entries(trStatusTokens).map(([key, token]) => [key, token.label])
)

export const trStatusBadgeClass: Record<string, string> = Object.fromEntries(
  Object.entries(trStatusTokens).map(([key, token]) => [key, token.badgeClass])
)

export const trUnits = [
  { label: 'SENAI', value: 'SENAI' as const, icon: ArrowRight },
  { label: 'SESI', value: 'SESI' as const, icon: ArrowRight },
  { label: 'IEL', value: 'IEL' as const, icon: ArrowRight },
  { label: 'FIEPE', value: 'FIEPE' as const, icon: ArrowRight },
  { label: 'CIEPE', value: 'CIEPE' as const, icon: ArrowRight },
] as const

export const trNatures = [
  { label: 'Aquisição', value: 'aquisicao' as const },
  { label: 'Serviço', value: 'servico' as const },
  { label: 'Consultoria', value: 'consultoria' as const },
  { label: 'Locação', value: 'locacao' as const },
  { label: 'Capacitação', value: 'capacitacao' as const },
] as const

export type TRNature = (typeof trNatures)[number]['value']

export const trNatureLabels: Record<TRNature, string> = Object.fromEntries(
  trNatures.map((n) => [n.value, n.label])
) as Record<TRNature, string>
