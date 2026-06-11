// Identidade do produto. Nome placeholder ("Fase Preparatória") — trocar aqui
// quando a marca definitiva for definida; sidebar, títulos e breadcrumb derivam daqui.
export const appIdentity = {
  name: 'Fase Preparatória',
  shortName: 'FP',
  subtitle: 'Contratações públicas',
}

export const currentUser = {
  name: 'Ana Ribeiro',
  email: 'ana.ribeiro@exemplo.gov.br',
  avatar: '',
  role: 'Requisitante',
}

export const trKpis = [
  {
    label: 'Total de documentos',
    value: 48,
    description: 'Documentos ativos entre rascunho e aprovação.',
    trend: { value: 12, direction: 'up' as const, period: 'vs. mês passado' },
  },
  {
    label: 'Rascunhos',
    value: 18,
    description: 'Documentos iniciados e ainda em elaboração pelas áreas.',
    trend: { value: 5, direction: 'up' as const, period: 'vs. mês passado' },
  },
  {
    label: 'Aprovados',
    value: 30,
    description: 'Documentos prontos para seguir o fluxo de contratação.',
    trend: { value: 18, direction: 'up' as const, period: 'vs. mês passado' },
  },
  {
    label: 'Taxa de aprovação',
    value: '62%',
    description: 'Documentos aprovados sobre o total de ativos.',
    trend: { value: 4, direction: 'up' as const, period: 'vs. mês passado' },
  },
] as const

import { trStatusTokens } from './data'

export const trStatusData = [
  {
    status: 'draft' as const,
    label: trStatusTokens.draft.label,
    value: 18,
    percentage: 38,
    color: trStatusTokens.draft.chartColor,
  },
  {
    status: 'approved' as const,
    label: trStatusTokens.approved.label,
    value: 30,
    percentage: 62,
    color: trStatusTokens.approved.chartColor,
  },
] as const

export const trUnitData = [
  { unit: 'SENAI', records: 16 },
  { unit: 'SESI', records: 11 },
  { unit: 'IEL', records: 9 },
  { unit: 'FIEPE', records: 7 },
  { unit: 'CIEPE', records: 5 },
] as const

export const recentTrs = [
  {
    id: 'TR-2026-014',
    title: 'Contratação de instrutor para NR-10',
    unit: 'SENAI',
    owner: 'Maykon Alves',
    status: 'approved' as const,
    updatedAt: '07/04/2026',
  },
  {
    id: 'TR-2026-013',
    title: 'Serviço de manutenção preventiva em elevadores',
    unit: 'SESI',
    owner: 'Ana Costa',
    status: 'draft' as const,
    updatedAt: '06/04/2026',
  },
  {
    id: 'TR-2026-012',
    title: 'Aquisição de kits didáticos para laboratório móvel',
    unit: 'IEL',
    owner: 'Juliana Ferraz',
    status: 'draft' as const,
    updatedAt: '05/04/2026',
  },
  {
    id: 'TR-2026-011',
    title: 'Contratação de consultoria para inovação industrial',
    unit: 'FIEPE',
    owner: 'Carlos Henrique',
    status: 'approved' as const,
    updatedAt: '03/04/2026',
  },
] as const
