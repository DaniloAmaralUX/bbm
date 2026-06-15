import {
  buildKpis,
  chainCompletion,
  countByDocType,
  countByStatus,
  countByUnit,
  recentDocuments,
} from './metrics'
import { trs } from './trs'

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

// Dados do dashboard derivados do conjunto real de documentos (RF-14: nada de
// números decorativos). A fonte é `trs.ts`; a agregação vive em `metrics.ts`.
export const trKpis = buildKpis(trs)
export const trStatusData = countByStatus(trs)
export const trUnitData = countByUnit(trs)
export const trDocTypeData = countByDocType(trs)
export const trChainFunnel = chainCompletion(trs)
export const recentTrs = recentDocuments(trs, 5)
