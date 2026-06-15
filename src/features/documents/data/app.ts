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
  { unit: 'Secretaria de Educação', records: 14 },
  { unit: 'Secretaria de Saúde', records: 12 },
  { unit: 'Secretaria de Administração', records: 10 },
  { unit: 'Secretaria de Infraestrutura', records: 8 },
  { unit: 'Procuradoria-Geral', records: 4 },
] as const

export const recentTrs = [
  {
    id: 'DFD-2026-031',
    docType: 'dfd' as const,
    title: 'Aquisição de mobiliário para as unidades de atendimento',
    unit: 'Secretaria de Administração',
    owner: 'Ana Ribeiro',
    status: 'draft' as const,
    updatedAt: '10/04/2026',
  },
  {
    id: 'ETP-2026-018',
    docType: 'etp' as const,
    title: 'Modernização da rede de iluminação pública',
    unit: 'Secretaria de Infraestrutura',
    owner: 'Marcos Tavares',
    status: 'draft' as const,
    updatedAt: '09/04/2026',
  },
  {
    id: 'TR-2026-012',
    docType: 'tr' as const,
    title: 'Serviço de limpeza das escolas municipais',
    unit: 'Secretaria de Educação',
    owner: 'Juliana Ferraz',
    status: 'approved' as const,
    updatedAt: '08/04/2026',
  },
  {
    id: 'DFD-2026-029',
    docType: 'dfd' as const,
    title: 'Aquisição de medicamentos para a rede básica de saúde',
    unit: 'Secretaria de Saúde',
    owner: 'Carlos Henrique',
    status: 'approved' as const,
    updatedAt: '05/04/2026',
  },
  {
    id: 'ETP-2026-016',
    docType: 'etp' as const,
    title: 'Locação de veículos para a frota administrativa',
    unit: 'Secretaria de Administração',
    owner: 'Renata Vieira',
    status: 'draft' as const,
    updatedAt: '03/04/2026',
  },
] as const
