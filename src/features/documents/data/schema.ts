import { z } from 'zod'

export const trStatusValues = ['draft', 'approved'] as const

// Unidades genéricas de uma prefeitura (substituem as instituições do TR Fácil).
export const trUnitValues = [
  'Secretaria de Administração',
  'Secretaria de Educação',
  'Secretaria de Saúde',
  'Secretaria de Infraestrutura',
  'Procuradoria-Geral',
] as const

export const trNatureValues = [
  'aquisicao',
  'servico',
  'consultoria',
  'locacao',
  'capacitacao',
] as const

// Ids dos tipos-semente (DFD/ETP/TR). F2: o tipo virou dado no registry
// (use-doc-types-store), entao `docType` aceita qualquer id (z.string()); esta
// lista serve apenas a faceta de filtro/rota das siglas-semente conhecidas.
export const docTypeValues = ['dfd', 'etp', 'tr'] as const

export const trSchema = z.object({
  id: z.string(),
  docType: z.string(),
  title: z.string(),
  unit: z.enum(trUnitValues),
  owner: z.string(),
  status: z.enum(trStatusValues),
  nature: z.enum(trNatureValues),
  updatedAt: z.string(),
  currentStep: z.string(),
  summary: z.string(),
  // Vínculo de cadeia: id do documento ancestral (ETP aponta para seu DFD; TR
  // para seu ETP). Ausente no DFD (raiz da cadeia) e em documentos avulsos.
  parentId: z.string().optional(),
})

export type TRItem = z.infer<typeof trSchema>
