import { type DocType, docTypeFullLabel } from './doc-type'

export type FieldInputType = 'text' | 'textarea' | 'select' | 'date' | 'email'

export type FieldDefinition = {
  id: string
  label: string
  input: FieldInputType
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  autocomplete?: string
  spellCheck?: boolean
  /**
   * Campo comum da cadeia DFD -> ETP -> TR: seu valor flui para o documento
   * seguinte (herança). A lógica de herança em si chega no PR-4
   * (inheritCommonFields); aqui só marcamos quais campos participam.
   */
  inheritable?: boolean
}

export type SectionKind = 'fields' | 'review'

export type SectionDefinition = {
  id: string
  title: string
  description: string
  kind: SectionKind
  fieldIds?: string[]
}

export type ModelDefinition = {
  docType: DocType
  label: string
  intro: string
  fields: Record<string, FieldDefinition>
  sections: SectionDefinition[]
}

export type DocumentData = Record<string, string>

export type ReviewState = {
  totalRequired: number
  completedRequired: number
  pendingLabels: string[]
  isReady: boolean
}

export type DocumentSection =
  | {
      kind: 'prose'
      title: string
      content: string
    }
  | {
      kind: 'keyValue'
      title: string
      items: Array<{ label: string; value: string }>
    }
  | {
      kind: 'table'
      title: string
      columns: string[]
      rows: string[][]
      emptyMessage?: string
    }

const unitOptions = [
  { label: 'Secretaria de Administração', value: 'Secretaria de Administração' },
  { label: 'Secretaria de Educação', value: 'Secretaria de Educação' },
  { label: 'Secretaria de Saúde', value: 'Secretaria de Saúde' },
  {
    label: 'Secretaria de Infraestrutura',
    value: 'Secretaria de Infraestrutura',
  },
  { label: 'Procuradoria-Geral', value: 'Procuradoria-Geral' },
]

const observedModeOptions = [
  { label: 'Pregão eletrônico', value: 'pregao_eletronico' },
  { label: 'Concorrência', value: 'concorrencia' },
  { label: 'Dispensa de licitação', value: 'dispensa' },
  { label: 'Inexigibilidade', value: 'inexigibilidade' },
]

/**
 * Ids canônicos dos campos comuns da cadeia DFD -> ETP -> TR (PRD secao 4).
 * Estes valores fluem para o documento seguinte via herança. O preenchimento
 * automático (inheritCommonFields) chega no PR-4; aqui marcamos os participantes.
 */
const commonFieldIds = [
  'object',
  'justification',
  'requestingUnit',
  'responsible',
  'pcaLink',
  'solution',
] as const

/** Marca como `inheritable` os campos cujo id participa da herança da cadeia. */
function markInheritableFields(
  fields: Record<string, FieldDefinition>
): Record<string, FieldDefinition> {
  const marked: Record<string, FieldDefinition> = {}
  for (const [fieldId, field] of Object.entries(fields)) {
    marked[fieldId] = commonFieldIds.includes(fieldId as never)
      ? { ...field, inheritable: true }
      : field
  }
  return marked
}

// --- Campos comuns da cadeia (reusados entre modelos) ---

const commonFields: Record<string, FieldDefinition> = {
  requestingUnit: {
    id: 'requestingUnit',
    label: 'Unidade requisitante',
    input: 'select',
    required: true,
    placeholder: 'Selecione a unidade',
    options: unitOptions,
  },
  responsible: {
    id: 'responsible',
    label: 'Responsável',
    input: 'text',
    required: true,
    placeholder: 'Ex.: Ana Ribeiro',
    autocomplete: 'name',
  },
  object: {
    id: 'object',
    label: 'Objeto',
    input: 'textarea',
    required: true,
    placeholder: 'Descreva claramente o objeto da contratação…',
    autocomplete: 'off',
  },
  justification: {
    id: 'justification',
    label: 'Justificativa',
    input: 'textarea',
    required: true,
    placeholder:
      'Explique a necessidade, o contexto e o resultado esperado…',
    autocomplete: 'off',
  },
  pcaLink: {
    id: 'pcaLink',
    label: 'Vínculo ao PCA',
    input: 'text',
    required: true,
    placeholder: 'Ex.: Item 12/2026 do Plano de Contratações Anual',
    autocomplete: 'off',
  },
  solution: {
    id: 'solution',
    label: 'Solução',
    input: 'textarea',
    required: true,
    placeholder: 'Solução técnica e economicamente mais viável…',
    autocomplete: 'off',
  },
}

// --- Modelos padrão por tipo de documento (dado fixo no v0; o construtor de
// modelos editável pela UI é a Fase 2). ---

const dfdModel: ModelDefinition = {
  docType: 'dfd',
  label: docTypeFullLabel('dfd'),
  intro:
    'Documento inaugural da cadeia: formaliza a necessidade da contratação.',
  fields: markInheritableFields({
    requestingUnit: commonFields.requestingUnit,
    responsible: commonFields.responsible,
    object: commonFields.object,
    justification: commonFields.justification,
    expectedDate: {
      id: 'expectedDate',
      label: 'Data prevista',
      input: 'date',
      required: true,
      placeholder: 'dd/mm/aaaa',
      autocomplete: 'off',
    },
    pcaLink: commonFields.pcaLink,
  }),
  sections: [
    {
      id: 'identification',
      title: '1. Identificação',
      description: 'Quem demanda e quem responde pela contratação.',
      kind: 'fields',
      fieldIds: ['requestingUnit', 'responsible'],
    },
    {
      id: 'object',
      title: '2. Objeto e justificativa',
      description: 'O que será contratado e por quê.',
      kind: 'fields',
      fieldIds: ['object', 'justification'],
    },
    {
      id: 'planning',
      title: '3. Planejamento',
      description: 'Prazo previsto e vínculo ao plano anual.',
      kind: 'fields',
      fieldIds: ['expectedDate', 'pcaLink'],
    },
    {
      id: 'review',
      title: 'Revisão final',
      description: 'Valide a prévia consolidada antes de concluir o DFD.',
      kind: 'review',
    },
  ],
}

const etpModel: ModelDefinition = {
  docType: 'etp',
  label: docTypeFullLabel('etp'),
  intro:
    'Estudo que avalia o problema, alternativas e viabilidade técnica e econômica.',
  fields: markInheritableFields({
    object: commonFields.object,
    justification: commonFields.justification,
    requestingUnit: commonFields.requestingUnit,
    responsible: commonFields.responsible,
    pcaLink: commonFields.pcaLink,
    problem: {
      id: 'problem',
      label: 'Problema',
      input: 'textarea',
      required: true,
      placeholder: 'Caracterize a necessidade a ser resolvida…',
      autocomplete: 'off',
    },
    requirements: {
      id: 'requirements',
      label: 'Requisitos',
      input: 'textarea',
      required: true,
      placeholder: 'Liste os requisitos técnicos e operacionais…',
      autocomplete: 'off',
    },
    quantities: {
      id: 'quantities',
      label: 'Quantidades',
      input: 'textarea',
      required: true,
      placeholder: 'Memória de cálculo e quantitativos estimados…',
      autocomplete: 'off',
    },
    marketResearch: {
      id: 'marketResearch',
      label: 'Levantamento de mercado',
      input: 'textarea',
      required: true,
      placeholder:
        'Referências de contratações anteriores, alternativas e faixa de preços…',
      description:
        'Na Fase 5 este campo recebe apoio de IA (PNCP e repositório próprio).',
      autocomplete: 'off',
    },
    estimatedValue: {
      id: 'estimatedValue',
      label: 'Valor estimado',
      input: 'text',
      required: true,
      placeholder: 'Ex.: R$ 120.000,00',
      autocomplete: 'off',
    },
    solution: commonFields.solution,
    conclusion: {
      id: 'conclusion',
      label: 'Conclusão',
      input: 'textarea',
      required: true,
      placeholder: 'Posicionamento conclusivo sobre a viabilidade…',
      autocomplete: 'off',
    },
  }),
  sections: [
    {
      id: 'object',
      title: '1. Objeto e justificativa',
      description: 'Informações herdadas do DFD; ajuste se necessário.',
      kind: 'fields',
      fieldIds: ['object', 'justification'],
    },
    {
      id: 'context',
      title: '2. Unidade e PCA',
      description: 'Unidade requisitante, responsável e vínculo ao plano.',
      kind: 'fields',
      fieldIds: ['requestingUnit', 'responsible', 'pcaLink'],
    },
    {
      id: 'analysis',
      title: '3. Análise do problema',
      description: 'Problema, requisitos e quantidades.',
      kind: 'fields',
      fieldIds: ['problem', 'requirements', 'quantities'],
    },
    {
      id: 'market',
      title: '4. Mercado e solução',
      description: 'Levantamento de mercado, valor estimado e solução adotada.',
      kind: 'fields',
      fieldIds: ['marketResearch', 'estimatedValue', 'solution'],
    },
    {
      id: 'conclusion',
      title: '5. Conclusão',
      description: 'Posicionamento conclusivo sobre a viabilidade.',
      kind: 'fields',
      fieldIds: ['conclusion'],
    },
    {
      id: 'review',
      title: 'Revisão final',
      description: 'Valide a prévia consolidada antes de concluir o ETP.',
      kind: 'review',
    },
  ],
}

const trModel: ModelDefinition = {
  docType: 'tr',
  label: docTypeFullLabel('tr'),
  intro:
    'Detalha a solução escolhida: requisitos, execução, medição e itens da contratação.',
  fields: markInheritableFields({
    object: commonFields.object,
    solution: commonFields.solution,
    requestingUnit: commonFields.requestingUnit,
    responsible: commonFields.responsible,
    pcaLink: commonFields.pcaLink,
    justification: commonFields.justification,
    requirements: {
      id: 'requirements',
      label: 'Requisitos da contratação',
      input: 'textarea',
      required: true,
      placeholder: 'Requisitos técnicos e operacionais da contratação…',
      autocomplete: 'off',
    },
    execution: {
      id: 'execution',
      label: 'Execução',
      input: 'textarea',
      required: true,
      placeholder: 'Rotinas, entregas e dinâmica de execução…',
      autocomplete: 'off',
    },
    measurement: {
      id: 'measurement',
      label: 'Critérios de medição',
      input: 'textarea',
      required: true,
      placeholder: 'Critérios de aceite, medição e pagamento…',
      autocomplete: 'off',
    },
    items: {
      id: 'items',
      label: 'Itens e quantidades',
      input: 'textarea',
      required: true,
      placeholder: 'Itens, unidades, quantidades e preços de referência…',
      description:
        'A tabela estruturada com sugestão de itens por IA chega no PR-5/Fase 5.',
      autocomplete: 'off',
    },
    observedMode: {
      id: 'observedMode',
      label: 'Modalidade observada',
      input: 'select',
      required: true,
      placeholder: 'Selecione a modalidade',
      options: observedModeOptions,
    },
  }),
  sections: [
    {
      id: 'object',
      title: '1. Objeto e solução',
      description: 'Objeto e solução herdados da jornada DFD -> ETP.',
      kind: 'fields',
      fieldIds: ['object', 'solution'],
    },
    {
      id: 'context',
      title: '2. Unidade e responsável',
      description: 'Unidade requisitante, responsável, PCA e justificativa.',
      kind: 'fields',
      fieldIds: ['requestingUnit', 'responsible', 'pcaLink', 'justification'],
    },
    {
      id: 'specification',
      title: '3. Especificação',
      description: 'Requisitos, execução e critérios de medição.',
      kind: 'fields',
      fieldIds: ['requirements', 'execution', 'measurement'],
    },
    {
      id: 'items',
      title: '4. Itens e modalidade',
      description: 'Itens da contratação e modalidade observada.',
      kind: 'fields',
      fieldIds: ['items', 'observedMode'],
    },
    {
      id: 'review',
      title: 'Revisão final',
      description: 'Valide a prévia consolidada antes de concluir o TR.',
      kind: 'review',
    },
  ],
}

export const modelDefinitions: Record<DocType, ModelDefinition> = {
  dfd: dfdModel,
  etp: etpModel,
  tr: trModel,
}

export function getModelForDocType(docType: DocType): ModelDefinition {
  return modelDefinitions[docType]
}

export function getResponsibleUnitOptions() {
  return unitOptions
}

export function createDocumentData(
  model: ModelDefinition,
  previousData?: DocumentData
): DocumentData {
  const nextData: DocumentData = {}
  Object.keys(model.fields).forEach((fieldId) => {
    const previousValue = previousData?.[fieldId]
    nextData[fieldId] = typeof previousValue === 'string' ? previousValue : ''
  })
  return nextData
}

export function buildReviewState(
  context: { title: string; responsibleUnit: string },
  model: ModelDefinition,
  documentData: DocumentData
): ReviewState {
  const pendingLabels: string[] = []
  let totalRequired = 2

  if (!hasValue(context.title)) pendingLabels.push('Título do documento')
  if (!hasValue(context.responsibleUnit))
    pendingLabels.push('Unidade responsável')

  Object.values(model.fields).forEach((field) => {
    if (!field.required) return
    totalRequired += 1
    if (!hasValue(documentData[field.id])) {
      pendingLabels.push(field.label)
    }
  })

  return {
    totalRequired,
    completedRequired: Math.max(totalRequired - pendingLabels.length, 0),
    pendingLabels,
    isReady: pendingLabels.length === 0,
  }
}

export function buildDocumentSections(
  context: {
    docType: DocType
    responsibleUnit: string
    title: string
  },
  model: ModelDefinition,
  documentData: DocumentData
): DocumentSection[] {
  const sections: DocumentSection[] = [
    {
      kind: 'keyValue',
      title: 'Contexto do documento',
      items: [
        { label: 'Tipo de documento', value: docTypeFullLabel(context.docType) },
        { label: 'Modelo', value: model.label },
        { label: 'Unidade responsável', value: context.responsibleUnit },
      ],
    },
  ]

  model.sections.forEach((section) => {
    if (section.kind !== 'fields') return
    const fieldIds = section.fieldIds ?? []
    const fields = fieldIds
      .map((fieldId) => model.fields[fieldId])
      .filter(Boolean)

    if (!fields.length) return

    if (fields.length === 1 && fields[0]?.input === 'textarea') {
      const field = fields[0]
      const content = String(documentData[field.id] ?? '')
      if (hasValue(content)) {
        sections.push({ kind: 'prose', title: section.title, content })
      }
      return
    }

    const items = fields
      .map((field) => ({
        label: field.label,
        value: String(documentData[field.id] ?? ''),
      }))
      .filter((item) => hasValue(item.value))

    if (items.length) {
      sections.push({ kind: 'keyValue', title: section.title, items })
    }
  })

  return sections
}

export function hasMeaningfulData(documentData: DocumentData) {
  return Object.values(documentData).some((value) => hasValue(value))
}

function hasValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}
