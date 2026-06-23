import {
  columnSum,
  formatCalculated,
  formatColumnCell,
  isMonetaryColumn,
  summableColumns,
} from './calc'
import { type DocType, docTypeFullLabel } from './doc-type'
import { formatBRL, formatQuantity, parseItems, parseNumber } from './items'

export type FieldInputType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'email'
  | 'number'
  | 'currency'
  | 'calculated'
  | 'itemsTable'

/**
 * Token de uma fórmula de campo calculado: referência a outro campo, operador
 * aritmético ou parêntese. A fórmula é guardada como lista de tokens (montada no
 * construtor) e avaliada por um parser próprio seguro em `calc.ts` (sem `eval`).
 */
export type CalcToken =
  | { kind: 'field'; fieldId: string }
  | { kind: 'op'; op: '+' | '-' | '*' | '/' }
  | { kind: 'paren'; paren: '(' | ')' }

/** Tipo de uma coluna da tabela de itens (campo `itemsTable`). */
export type ItemColumnType = 'text' | 'number' | 'currency' | 'calculated'

/**
 * Coluna configurável da tabela de itens: nome + tipo. Colunas `calculated`
 * têm uma fórmula por linha sobre OUTRAS colunas (os `fieldId` dos tokens são
 * ids de coluna), avaliada pelo mesmo motor seguro de `calc.ts`.
 */
export type ItemColumnDef = {
  id: string
  label: string
  type: ItemColumnType
  formula?: CalcToken[]
}

export type FieldDefinition = {
  id: string
  label: string
  input: FieldInputType
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  /** Campo calculado (input 'calculated'): fórmula em tokens sobre outros campos. */
  formula?: CalcToken[]
  /** Tabela de itens (input 'itemsTable'): definição das colunas. */
  columns?: ItemColumnDef[]
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

/** Estado de publicação de um modelo (Fase 2 - construtor de modelos). */
export type ModelState = 'draft' | 'published'

export type ModelDefinition = {
  /** Id único do modelo (há vários modelos por DocType). */
  id: string
  docType: DocType
  /** Nome do modelo dado pela Sustentação (ex.: "DFD de aquisição"). */
  name: string
  /** Rótulo do tipo de documento (DFD/ETP/TR por extenso). */
  label: string
  intro: string
  state: ModelState
  version: number
  updatedAt: string
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
  {
    label: 'Secretaria de Administração',
    value: 'Secretaria de Administração',
  },
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
 * Colunas padrão da tabela de itens (semente do TR e carga de "Sugerir itens").
 * A coluna `total` é calculada (Quantidade × Preço unitário), preservando o
 * comportamento histórico do TR agora que as colunas são configuráveis.
 */
export const DEFAULT_ITEM_COLUMNS: ItemColumnDef[] = [
  { id: 'description', label: 'Descrição', type: 'text' },
  { id: 'unit', label: 'Unidade', type: 'text' },
  { id: 'quantity', label: 'Quantidade', type: 'number' },
  { id: 'unitPrice', label: 'Preço unitário', type: 'currency' },
  {
    id: 'total',
    label: 'Total',
    type: 'calculated',
    formula: [
      { kind: 'field', fieldId: 'quantity' },
      { kind: 'op', op: '*' },
      { kind: 'field', fieldId: 'unitPrice' },
    ],
  },
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
    placeholder: 'Explique a necessidade, o contexto e o resultado esperado…',
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
  id: 'model-dfd-padrao',
  docType: 'dfd',
  name: 'Modelo padrão de DFD',
  label: docTypeFullLabel('dfd'),
  intro:
    'Documento inaugural da cadeia: formaliza a necessidade da contratação.',
  state: 'published',
  version: 1,
  updatedAt: '2026-06-01',
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
  id: 'model-etp-padrao',
  docType: 'etp',
  name: 'Modelo padrão de ETP',
  label: docTypeFullLabel('etp'),
  intro:
    'Estudo que avalia o problema, alternativas e viabilidade técnica e econômica.',
  state: 'published',
  version: 1,
  updatedAt: '2026-06-01',
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
  id: 'model-tr-padrao',
  docType: 'tr',
  name: 'Modelo padrão de TR',
  label: docTypeFullLabel('tr'),
  intro:
    'Detalha a solução escolhida: requisitos, execução, medição e itens da contratação.',
  state: 'published',
  version: 1,
  updatedAt: '2026-06-01',
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
      input: 'itemsTable',
      required: true,
      placeholder: 'Itens, unidades, quantidades e preços de referência…',
      description:
        'Tabela de itens da contratação. Use "Sugerir itens" para o apoio de IA.',
      columns: DEFAULT_ITEM_COLUMNS,
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

// --- Modelos de DEMO (publicados na carga inicial) --------------------------
// Modelos completos e PUBLICADOS dos tipos de demonstração (laudo, contrato),
// para mostrar os campos ricos fora da cadeia DFD/ETP/TR: seleção, data, moeda,
// calculado e tabela de itens. Seedados junto dos padrão em `standardModels`.
// Remover estes (e o bloco de tipos demo em doc-types-registry.ts) deixa só a
// cadeia-semente.
const laudoModel: ModelDefinition = {
  id: 'model-laudo-demo',
  docType: 'laudo',
  name: 'Modelo padrão de Laudo Técnico',
  label: docTypeFullLabel('laudo'),
  intro:
    'Avaliação técnica de bens ou serviços: identificação, parecer, itens avaliados e valoração.',
  state: 'published',
  version: 1,
  updatedAt: '2026-06-20',
  fields: {
    unidade: {
      id: 'unidade',
      label: 'Unidade requisitante',
      input: 'select',
      required: true,
      placeholder: 'Selecione a unidade',
      options: unitOptions,
    },
    responsavel: {
      id: 'responsavel',
      label: 'Responsável técnico',
      input: 'text',
      required: true,
      placeholder: 'Nome do responsável pela análise',
      autocomplete: 'off',
    },
    dataVistoria: {
      id: 'dataVistoria',
      label: 'Data da vistoria',
      input: 'date',
      required: true,
    },
    objeto: {
      id: 'objeto',
      label: 'Objeto da análise',
      input: 'textarea',
      required: true,
      placeholder: 'Bem, serviço ou situação avaliada…',
      autocomplete: 'off',
    },
    classificacao: {
      id: 'classificacao',
      label: 'Classificação',
      input: 'select',
      required: true,
      placeholder: 'Selecione a classificação',
      options: [
        { label: 'Conforme', value: 'conforme' },
        { label: 'Conforme com ressalvas', value: 'conforme_ressalvas' },
        { label: 'Não conforme', value: 'nao_conforme' },
      ],
    },
    parecer: {
      id: 'parecer',
      label: 'Parecer técnico',
      input: 'textarea',
      required: true,
      placeholder: 'Análise, fundamentação e conclusão técnica…',
      autocomplete: 'off',
    },
    itens: {
      id: 'itens',
      label: 'Itens avaliados',
      input: 'itemsTable',
      required: true,
      description: 'Itens, quantidades e valores de referência avaliados.',
      columns: DEFAULT_ITEM_COLUMNS,
      autocomplete: 'off',
    },
    valorBase: {
      id: 'valorBase',
      label: 'Valor base estimado',
      input: 'currency',
      required: true,
      placeholder: 'R$ 0,00',
    },
    adicional: {
      id: 'adicional',
      label: 'Adicional técnico',
      input: 'currency',
      placeholder: 'R$ 0,00',
    },
    valorTotal: {
      id: 'valorTotal',
      label: 'Valor total estimado',
      input: 'calculated',
      formula: [
        { kind: 'field', fieldId: 'valorBase' },
        { kind: 'op', op: '+' },
        { kind: 'field', fieldId: 'adicional' },
      ],
    },
  },
  sections: [
    {
      id: 'identificacao',
      title: '1. Identificação',
      description: 'Unidade, responsável técnico e data da vistoria.',
      kind: 'fields',
      fieldIds: ['unidade', 'responsavel', 'dataVistoria'],
    },
    {
      id: 'analise',
      title: '2. Análise',
      description: 'Objeto, classificação e parecer técnico.',
      kind: 'fields',
      fieldIds: ['objeto', 'classificacao', 'parecer'],
    },
    {
      id: 'itensSection',
      title: '3. Itens avaliados',
      description: 'Tabela de itens com valores de referência.',
      kind: 'fields',
      fieldIds: ['itens'],
    },
    {
      id: 'valoracao',
      title: '4. Valoração',
      description: 'Valor base, adicional e total estimado (calculado).',
      kind: 'fields',
      fieldIds: ['valorBase', 'adicional', 'valorTotal'],
    },
    {
      id: 'review',
      title: 'Revisão final',
      description: 'Valide a prévia consolidada antes de concluir o laudo.',
      kind: 'review',
    },
  ],
}

const contratoModel: ModelDefinition = {
  id: 'model-contrato-demo',
  docType: 'contrato',
  name: 'Modelo padrão de Termo de Contrato',
  label: docTypeFullLabel('contrato'),
  intro:
    'Formaliza a contratação: partes, objeto, vigência, modalidade e valores.',
  state: 'published',
  version: 1,
  updatedAt: '2026-06-20',
  fields: {
    contratante: {
      id: 'contratante',
      label: 'Contratante',
      input: 'text',
      required: true,
      placeholder: 'Órgão ou entidade contratante',
      autocomplete: 'off',
    },
    contratada: {
      id: 'contratada',
      label: 'Contratada',
      input: 'text',
      required: true,
      placeholder: 'Razão social da contratada',
      autocomplete: 'off',
    },
    cnpj: {
      id: 'cnpj',
      label: 'CNPJ da contratada',
      input: 'text',
      required: true,
      placeholder: '00.000.000/0000-00',
      autocomplete: 'off',
    },
    objeto: {
      id: 'objeto',
      label: 'Objeto do contrato',
      input: 'textarea',
      required: true,
      placeholder: 'Descrição do objeto contratado…',
      autocomplete: 'off',
    },
    modalidade: {
      id: 'modalidade',
      label: 'Modalidade da contratação',
      input: 'select',
      required: true,
      placeholder: 'Selecione a modalidade',
      options: observedModeOptions,
    },
    dataInicio: {
      id: 'dataInicio',
      label: 'Início da vigência',
      input: 'date',
      required: true,
    },
    prazo: {
      id: 'prazo',
      label: 'Prazo (meses)',
      input: 'number',
      required: true,
      placeholder: 'Ex.: 12',
    },
    valorMensal: {
      id: 'valorMensal',
      label: 'Valor mensal',
      input: 'currency',
      required: true,
      placeholder: 'R$ 0,00',
    },
    valorTotal: {
      id: 'valorTotal',
      label: 'Valor total do contrato',
      input: 'calculated',
      formula: [
        { kind: 'field', fieldId: 'valorMensal' },
        { kind: 'op', op: '*' },
        { kind: 'field', fieldId: 'prazo' },
      ],
    },
  },
  sections: [
    {
      id: 'partes',
      title: '1. Partes',
      description: 'Contratante, contratada e CNPJ.',
      kind: 'fields',
      fieldIds: ['contratante', 'contratada', 'cnpj'],
    },
    {
      id: 'objetoSection',
      title: '2. Objeto e vigência',
      description: 'Objeto, modalidade, início e prazo.',
      kind: 'fields',
      fieldIds: ['objeto', 'modalidade', 'dataInicio', 'prazo'],
    },
    {
      id: 'valores',
      title: '3. Valores',
      description: 'Valor mensal e total do contrato (calculado).',
      kind: 'fields',
      fieldIds: ['valorMensal', 'valorTotal'],
    },
    {
      id: 'review',
      title: 'Revisão final',
      description: 'Valide a prévia consolidada antes de concluir o termo.',
      kind: 'review',
    },
  ],
}

/** Modelos de demonstração (tipos custom), publicados na carga inicial. */
const demoModels: ModelDefinition[] = [laudoModel, contratoModel]

/**
 * Modelos padrão da Fase 1, agora usados como SEED da store de modelos
 * (Fase 2). A Sustentação pode criar outros modelos por tipo; o accessor
 * `getModelForDocType` vive em `@/features/models` e le da store publicada.
 */
export const standardModelByType: Record<DocType, ModelDefinition> = {
  dfd: dfdModel,
  etp: etpModel,
  tr: trModel,
}

export const standardModels: ModelDefinition[] = [
  ...Object.values(standardModelByType),
  ...demoModels,
]

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
    if (field.input === 'calculated') return // derivado, nunca preenchido
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

/**
 * Converte o valor (JSON) de um campo de itens numa seção `table`. Retorna null
 * quando não há itens. Última linha = "Total geral". Reusado pela Revisão do
 * wizard e pelo artefato (view/export).
 */
export function itemsToTableSection(
  value: string,
  title: string,
  columns: ItemColumnDef[]
): DocumentSection | null {
  if (!columns.length) return null
  const rows = parseItems(value)
  if (!rows.length) return null
  const tableRows = rows.map((row) =>
    columns.map((column) => formatColumnCell(row, column, columns))
  )
  const summable = summableColumns(columns)
  if (summable.length) {
    const summableIds = new Set(summable.map((column) => column.id))
    tableRows.push(
      columns.map((column, index) => {
        if (index === 0) return 'Total geral'
        if (!summableIds.has(column.id)) return ''
        const total = columnSum(rows, column, columns)
        return isMonetaryColumn(column, columns)
          ? formatBRL(total)
          : formatQuantity(total)
      })
    )
  }
  return {
    kind: 'table',
    title,
    columns: columns.map((column) => column.label),
    rows: tableRows,
  }
}

/**
 * Formata o valor de um campo para exibição no artefato: moeda em R$ e número
 * em pt-BR; demais tipos saem como digitados. Valor não-numérico cai no texto cru.
 */
function formatFieldValue(field: FieldDefinition, raw: string): string {
  if (field.input === 'currency') {
    const value = parseNumber(raw)
    return Number.isNaN(value) ? raw : formatBRL(value)
  }
  if (field.input === 'number') {
    const value = parseNumber(raw)
    return Number.isNaN(value) ? raw : formatQuantity(value)
  }
  return raw
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
        {
          label: 'Tipo de documento',
          value: docTypeFullLabel(context.docType),
        },
        { label: 'Modelo', value: model.label },
        { label: 'Unidade responsável', value: context.responsibleUnit },
      ],
    },
  ]

  // Monta um item label/valor para um campo; null quando vazio (texto/numérico)
  // ou incompleto/inválido (calculado). Calculados são derivados na hora.
  const toItem = (
    field: FieldDefinition
  ): { label: string; value: string } | null => {
    if (field.input === 'calculated') {
      const value = formatCalculated(field, model, documentData)
      return value === '—' ? null : { label: field.label, value }
    }
    const raw = String(documentData[field.id] ?? '')
    if (!hasValue(raw)) return null
    return { label: field.label, value: formatFieldValue(field, raw) }
  }

  model.sections.forEach((section) => {
    if (section.kind !== 'fields') return
    const fieldIds = section.fieldIds ?? []
    const fields = fieldIds
      .map((fieldId) => model.fields[fieldId])
      .filter(Boolean)

    if (!fields.length) return

    const itemsField = fields.find((field) => field.input === 'itemsTable')
    if (itemsField) {
      const table = itemsToTableSection(
        String(documentData[itemsField.id] ?? ''),
        section.title,
        itemsField.columns ?? DEFAULT_ITEM_COLUMNS
      )
      if (table) sections.push(table)
      const others = fields
        .filter((field) => field.id !== itemsField.id)
        .map(toItem)
        .filter(
          (item): item is { label: string; value: string } => item !== null
        )
      if (others.length) {
        sections.push({ kind: 'keyValue', title: 'Modalidade', items: others })
      }
      return
    }

    if (fields.length === 1 && fields[0]?.input === 'textarea') {
      const field = fields[0]
      const content = String(documentData[field.id] ?? '')
      if (hasValue(content)) {
        sections.push({ kind: 'prose', title: section.title, content })
      }
      return
    }

    const items = fields
      .map(toItem)
      .filter((item): item is { label: string; value: string } => item !== null)

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
