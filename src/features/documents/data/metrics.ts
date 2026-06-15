import { type TRStatus, trStatusTokens } from './data'
import { type TRItem } from './schema'

/**
 * Agregadores puros do dashboard: derivam os KPIs e as distribuições do conjunto
 * real de documentos (`trs.ts`), em vez de números decorativos (RF-14). Os
 * retornos já saem no formato que cada componente de gráfico consome.
 */

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR')

/** Converte `AAAA-MM-DD` num Date LOCAL (evita deslocamento de fuso do parse ISO). */
function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

/** Ordem canônica dos status na visualização (rascunho antes de aprovado). */
const statusOrder: TRStatus[] = ['draft', 'approved']

export type StatusCount = {
  status: TRStatus
  label: string
  value: number
  color: string
}

/** Conta documentos por status, na ordem canônica. Shape pronto para o gráfico. */
export function countByStatus(items: TRItem[]): StatusCount[] {
  return statusOrder.map((status) => ({
    status,
    label: trStatusTokens[status].label,
    value: items.filter((item) => item.status === status).length,
    color: trStatusTokens[status].chartColor,
  }))
}

export type UnitCount = { unit: string; records: number }

/** Conta documentos por unidade, em ordem decrescente; omite unidades sem documentos. */
export function countByUnit(items: TRItem[]): UnitCount[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item.unit, (counts.get(item.unit) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([unit, records]) => ({ unit, records }))
    .sort((a, b) => b.records - a.records)
}

export type RecentDocument = {
  id: string
  title: string
  unit: string
  owner: string
  status: TRStatus
  updatedAt: string
}

/** Documentos mais recentes (updatedAt desc), com a data já formatada em pt-BR. */
export function recentDocuments(items: TRItem[], limit = 5): RecentDocument[] {
  return [...items]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      title: item.title,
      unit: item.unit,
      owner: item.owner,
      status: item.status,
      updatedAt: dateFormatter.format(parseLocalDate(item.updatedAt)),
    }))
}

export type KpiItem = {
  label: string
  value: number | string
  description?: string
}

/** KPIs de topo derivados do conjunto: total, rascunhos, aprovados e taxa de aprovação. */
export function buildKpis(items: TRItem[]): KpiItem[] {
  const total = items.length
  const drafts = items.filter((item) => item.status === 'draft').length
  const approved = items.filter((item) => item.status === 'approved').length
  const rate = total === 0 ? 0 : approved / total

  return [
    {
      label: 'Total de documentos',
      value: total,
      description: 'Documentos cadastrados na fase preparatória.',
    },
    {
      label: 'Rascunhos',
      value: drafts,
      description: 'Documentos iniciados e ainda em elaboração pelas áreas.',
    },
    {
      label: 'Aprovados',
      value: approved,
      description: 'Documentos prontos para seguir o fluxo de contratação.',
    },
    {
      label: 'Taxa de aprovação',
      value: percentFormatter.format(rate),
      description: 'Documentos aprovados sobre o total cadastrado.',
    },
  ]
}
