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

// Mantido em sincronia com DocType ('dfd' | 'etp' | 'tr') em ./doc-type.
export const docTypeValues = ['dfd', 'etp', 'tr'] as const

export const trSchema = z.object({
  id: z.string(),
  docType: z.enum(docTypeValues),
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
