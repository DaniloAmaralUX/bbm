import { formatDocDate } from '@/shared/lib/format-date'
import { childrenOf, isConcluded } from './chain'
import { type TRStatus, trStatusTokens } from './data'
import {
  type DocType,
  allDocTypes,
  chainTypesOf,
  docTypeLabel,
  parentOf,
} from './doc-type'
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
      updatedAt: formatDocDate(item.updatedAt),
    }))
}

export type DocTypeCount = { docType: DocType; label: string; records: number }

/** Conta documentos por tipo, na ordem do registry. */
export function countByDocType(items: TRItem[]): DocTypeCount[] {
  return allDocTypes().map((docType) => ({
    docType,
    label: docTypeLabel(docType),
    records: items.filter((item) => item.docType === docType).length,
  }))
}

export type ChainFunnelStage = {
  docType: DocType
  label: string
  count: number
}

export type ChainFunnel = {
  /** Total de cadeias (cada DFD e a raiz de uma cadeia). */
  totalChains: number
  /** Etapas concluidas, monotonicas: DFD >= ETP >= TR. */
  stages: ChainFunnelStage[]
  /** Cadeias que chegaram a um TR aprovado. */
  completedChains: number
  /** completedChains / totalChains (0 quando nao ha cadeias). */
  rate: number
}

/**
 * Funil de conclusao da cadeia: a partir do tipo-raiz (sem pai e com filhos no
 * registry), conta quantas cadeias concluiram cada etapa, em ordem. A contagem
 * e monotonica — uma etapa so conta se a anterior foi concluida na mesma cadeia
 * (a regra de dependencia da cadeia garante que um filho concluido tem o pai
 * concluido). A "taxa de conclusao" (RF-14) e a fracao de cadeias que chegaram
 * ao ultimo documento concluido. Sem cadeia ramificada no registry, vazio.
 */
export function chainCompletion(items: TRItem[]): ChainFunnel {
  const rootType = allDocTypes().find(
    (type) => parentOf(type) === null && chainTypesOf(type).length > 1
  )
  if (!rootType) {
    return { totalChains: 0, stages: [], completedChains: 0, rate: 0 }
  }

  const chainTypes = chainTypesOf(rootType)
  const roots = items.filter((item) => item.docType === rootType)
  const counts = chainTypes.map(() => 0)

  for (const root of roots) {
    let node: TRItem | undefined = root
    for (let stage = 0; stage < chainTypes.length; stage += 1) {
      if (!node || node.docType !== chainTypes[stage] || !isConcluded(node)) {
        break
      }
      counts[stage] += 1
      const nextType = chainTypes[stage + 1]
      node = nextType
        ? childrenOf(node.id, items).find((child) => child.docType === nextType)
        : undefined
    }
  }

  const totalChains = roots.length
  const completedChains = counts[counts.length - 1] ?? 0
  return {
    totalChains,
    stages: chainTypes.map((docType, stage) => ({
      docType,
      label: `${docTypeLabel(docType)} concluído`,
      count: counts[stage],
    })),
    completedChains,
    rate: totalChains === 0 ? 0 : completedChains / totalChains,
  }
}

export type KpiItem = {
  label: string
  value: number | string
  description?: string
}

/** KPIs de topo derivados do conjunto: total, rascunhos, concluídos e taxa de conclusão. */
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
      label: 'Concluídos',
      value: approved,
      description: 'Documentos prontos para seguir o fluxo de contratação.',
    },
    {
      label: 'Taxa de conclusão',
      value: percentFormatter.format(rate),
      description: 'Documentos concluídos sobre o total cadastrado.',
    },
  ]
}
