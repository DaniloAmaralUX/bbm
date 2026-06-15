import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  GitBranch,
  Link2,
  Minus,
} from 'lucide-react'
import { type ChainRole, chainRoleLabels, chainRoleValues } from './chain'
import { type DocType, docTypeLabel, docTypes } from './doc-type'

export const trStatuses = [
  {
    label: 'Rascunho',
    value: 'draft' as const,
    icon: Circle,
  },
  {
    label: 'Concluído',
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
    label: 'Concluído',
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
  {
    label: 'Secretaria de Administração',
    value: 'Secretaria de Administração' as const,
    icon: ArrowRight,
  },
  {
    label: 'Secretaria de Educação',
    value: 'Secretaria de Educação' as const,
    icon: ArrowRight,
  },
  {
    label: 'Secretaria de Saúde',
    value: 'Secretaria de Saúde' as const,
    icon: ArrowRight,
  },
  {
    label: 'Secretaria de Infraestrutura',
    value: 'Secretaria de Infraestrutura' as const,
    icon: ArrowRight,
  },
  {
    label: 'Procuradoria-Geral',
    value: 'Procuradoria-Geral' as const,
    icon: ArrowRight,
  },
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

// Opções de filtro por tipo de documento (faceta da listagem).
export const docTypeOptions: {
  label: string
  value: DocType
  icon: React.ComponentType<{ className?: string }>
}[] = docTypes.map((docType) => ({
  label: docTypeLabel(docType),
  value: docType,
  icon: FileText,
}))

// Opções de filtro por vínculo de cadeia (faceta da listagem).
const chainRoleIcons: Record<
  ChainRole,
  React.ComponentType<{ className?: string }>
> = {
  root: GitBranch,
  linked: Link2,
  standalone: Minus,
}

export const chainRoleOptions: {
  label: string
  value: ChainRole
  icon: React.ComponentType<{ className?: string }>
}[] = chainRoleValues.map((value) => ({
  label: chainRoleLabels[value],
  value,
  icon: chainRoleIcons[value],
}))
