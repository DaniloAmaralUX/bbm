import {
  buildKpis,
  chainCompletion,
  countByDocType,
  countByStatus,
  countByUnit,
  recentDocuments,
} from './metrics'
import { trs } from './trs'

// Identidade do produto. Fonte única: sidebar, títulos, breadcrumb e o cabeçalho
// dos documentos exportados derivam daqui.
export const appIdentity = {
  name: 'Doc Fácil GoV',
  shortName: 'DFG',
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
