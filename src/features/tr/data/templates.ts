export const trInstitutions = ['FIEPE', 'IEL', 'SESI'] as const

export const trTemplateTypes = [
  'consultoria',
  'locacao_maquinas_equipamentos',
  'capacitacoes',
  'coffee_break',
  'instrutoria',
  'servicos_graficos',
  'modelo_oficial_sesi',
] as const

export type TRInstitution = (typeof trInstitutions)[number]
export type TRTemplateType = (typeof trTemplateTypes)[number]

export type TRFieldInputType = 'text' | 'textarea' | 'select' | 'date' | 'email'

export type TRFieldDefinition = {
  id: string
  label: string
  input: TRFieldInputType
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  autocomplete?: string
  spellCheck?: boolean
}

export type TRSectionKind = 'fields' | 'lots' | 'deliveries' | 'review'

export type TRSectionDefinition = {
  id: string
  title: string
  description: string
  kind: TRSectionKind
  fieldIds?: string[]
}

export type TRTemplateDefinition = {
  institution: TRInstitution
  templateType: TRTemplateType
  label: string
  badge: string
  intro: string
  fields: Record<string, TRFieldDefinition>
  sections: TRSectionDefinition[]
}

export type TRLotItem = {
  id: string
  location: string
  itemCode: string
  summary: string
  unitMeasure: string
  quantity: string
  delivery: string
}

export type TRLot = {
  id: string
  number: string
  name: string
  items: TRLotItem[]
}

export type TRDeliveryLocation = {
  id: string
  institutionUnit: string
  cnpj: string
  address: string
}

export type TRDocumentData = Record<
  string,
  string | TRLot[] | TRDeliveryLocation[]
>

export type TRReviewState = {
  totalRequired: number
  completedRequired: number
  pendingLabels: string[]
  isReady: boolean
}

export type TRDocumentSection =
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
  { label: 'Sede Recife', value: 'Sede Recife' },
  { label: 'Unidade Paulista', value: 'Unidade Paulista' },
  { label: 'Unidade Caruaru', value: 'Unidade Caruaru' },
  { label: 'Unidade Goiana', value: 'Unidade Goiana' },
]

const modeOptions = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Híbrida', value: 'hibrida' },
  { label: 'Remota', value: 'remota' },
]

const institutionalFields: Record<string, TRFieldDefinition> = {
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
      'Explique a necessidade institucional, o contexto e o resultado esperado…',
    autocomplete: 'off',
  },
  serviceSummary: {
    id: 'serviceSummary',
    label: 'Descrição resumida do escopo',
    input: 'textarea',
    required: true,
    placeholder:
      'Apresente o serviço, o recorte do trabalho e a abordagem pretendida…',
    autocomplete: 'off',
  },
  programPeriod: {
    id: 'programPeriod',
    label: 'Período de realização',
    input: 'text',
    required: true,
    placeholder: 'Ex.: agosto a novembro de 2026',
    autocomplete: 'off',
  },
  deliveryMode: {
    id: 'deliveryMode',
    label: 'Modalidade',
    input: 'select',
    required: true,
    placeholder: 'Selecione a modalidade',
    options: modeOptions,
  },
  workload: {
    id: 'workload',
    label: 'Carga horária total ou janela operacional',
    input: 'text',
    required: true,
    placeholder: 'Ex.: 64 horas',
    autocomplete: 'off',
  },
  scopeSteps: {
    id: 'scopeSteps',
    label: 'Etapas, escopo detalhado ou itens do serviço',
    input: 'textarea',
    required: true,
    placeholder:
      'Liste etapas, marcos, frentes de atuação ou especificações centrais…',
    autocomplete: 'off',
  },
  finalDeliverables: {
    id: 'finalDeliverables',
    label: 'Entregáveis finais',
    input: 'textarea',
    required: true,
    placeholder:
      'Informe produtos finais, relatórios, evidências e materiais esperados…',
    autocomplete: 'off',
  },
  deliveryLocation: {
    id: 'deliveryLocation',
    label: 'Locais de entrega dos bens ou realização dos serviços',
    input: 'textarea',
    required: true,
    placeholder:
      'Detalhe unidades, formato de atendimento, endereços e restrições logísticas…',
    autocomplete: 'off',
  },
  monitoringArea: {
    id: 'monitoringArea',
    label: 'Área ou unidade responsável pelo acompanhamento',
    input: 'text',
    required: true,
    placeholder: 'Ex.: Unidade de Competitividade Industrial',
    autocomplete: 'organization',
  },
  monitoringResponsible: {
    id: 'monitoringResponsible',
    label: 'Responsável pelo acompanhamento',
    input: 'text',
    required: true,
    placeholder: 'Ex.: Maria Silva',
    autocomplete: 'name',
  },
  monitoringEmail: {
    id: 'monitoringEmail',
    label: 'E-mail de acompanhamento',
    input: 'email',
    required: true,
    placeholder: 'nome@instituicao.com.br',
    autocomplete: 'email',
    spellCheck: false,
  },
  monitoringNotes: {
    id: 'monitoringNotes',
    label: 'Observações de acompanhamento',
    input: 'textarea',
    required: false,
    placeholder:
      'Informe ritos, evidências de aceite, checkpoints e observações adicionais…',
    autocomplete: 'off',
  },
  hiringRequirements: {
    id: 'hiringRequirements',
    label: 'Requisitos para contratação',
    input: 'textarea',
    required: true,
    placeholder:
      'Liste experiência exigida, requisitos técnicos, documentos e condicionantes…',
    autocomplete: 'off',
  },
  paymentMilestones: {
    id: 'paymentMilestones',
    label: 'Forma de pagamento',
    input: 'textarea',
    required: true,
    placeholder:
      'Defina medições, marcos de aceite e condições de faturamento…',
    autocomplete: 'off',
  },
  invoiceGuidance: {
    id: 'invoiceGuidance',
    label: 'Observações de faturamento e descrição de NF',
    input: 'textarea',
    required: true,
    placeholder:
      'Registre convênio, descrição esperada da NF e observações obrigatórias…',
    autocomplete: 'off',
  },
  generalConditions: {
    id: 'generalConditions',
    label: 'Condições gerais',
    input: 'textarea',
    required: true,
    placeholder:
      'Inclua condições complementares, premissas operacionais e critérios de aceite…',
    autocomplete: 'off',
  },
}

const sesiFields: Record<string, TRFieldDefinition> = {
  object: {
    id: 'object',
    label: 'Objeto',
    input: 'textarea',
    required: true,
    placeholder:
      'Defina o objeto oficial da contratação conforme o TR do SESI…',
    autocomplete: 'off',
  },
  objective: {
    id: 'objective',
    label: 'Justificativa e objetivo da contratação',
    input: 'textarea',
    required: true,
    placeholder:
      'Descreva a motivação institucional e o objetivo final pretendido…',
    autocomplete: 'off',
  },
  hiringJustification: {
    id: 'hiringJustification',
    label: 'Justificativa da contratação',
    input: 'textarea',
    required: true,
    placeholder:
      'Explique a necessidade concreta da contratação e os impactos esperados…',
    autocomplete: 'off',
  },
  lotGroupingJustification: {
    id: 'lotGroupingJustification',
    label: 'Justificativa para o agrupamento em lotes',
    input: 'textarea',
    required: true,
    placeholder: 'Fundamente a adoção de lote único ou a divisão por lotes…',
    autocomplete: 'off',
  },
  technicalSpecifications: {
    id: 'technicalSpecifications',
    label: 'Especificações técnicas e entrega/fornecimento',
    input: 'textarea',
    required: true,
    placeholder:
      'Consolide requisitos técnicos, materiais, acabamentos, fornecimento e critérios centrais…',
    autocomplete: 'off',
  },
  warrantyConditions: {
    id: 'warrantyConditions',
    label: 'Garantia e assistência',
    input: 'textarea',
    required: true,
    placeholder:
      'Detalhe garantia, suporte, manutenção, cobertura e prazo de atendimento…',
    autocomplete: 'off',
  },
  deliveryInstallTerm: {
    id: 'deliveryInstallTerm',
    label: 'Prazos de entrega e instalação',
    input: 'textarea',
    required: true,
    placeholder:
      'Defina prazo total, marcos intermediários e janelas de entrega/instalação…',
    autocomplete: 'off',
  },
  installationWindow: {
    id: 'installationWindow',
    label: 'Condições operacionais de instalação',
    input: 'textarea',
    required: true,
    placeholder:
      'Informe horário permitido, acessos, restrições, montagem e operação em campo…',
    autocomplete: 'off',
  },
  operationalNotes: {
    id: 'operationalNotes',
    label: 'Observações operacionais complementares',
    input: 'textarea',
    required: true,
    placeholder:
      'Registre exigências adicionais, documentos operacionais e premissas de execução…',
    autocomplete: 'off',
  },
  sampleRequirement: {
    id: 'sampleRequirement',
    label: 'Apresentação de amostra',
    input: 'textarea',
    required: true,
    placeholder:
      'Informe se há amostra, como será apresentada e qual o critério de avaliação…',
    autocomplete: 'off',
  },
  contractTerm: {
    id: 'contractTerm',
    label: 'Prazos de vigência',
    input: 'textarea',
    required: true,
    placeholder:
      'Defina vigência, início previsto e prazos contratuais relevantes…',
    autocomplete: 'off',
  },
  budgetResources: {
    id: 'budgetResources',
    label: 'Recursos orçamentários',
    input: 'textarea',
    required: true,
    placeholder:
      'Descreva fonte orçamentária, centro de custo e vinculação financeira…',
    autocomplete: 'off',
  },
  proposalRequirements: {
    id: 'proposalRequirements',
    label: 'Proposta',
    input: 'textarea',
    required: true,
    placeholder:
      'Liste o conteúdo obrigatório da proposta comercial e técnica…',
    autocomplete: 'off',
  },
  qualificationRequirements: {
    id: 'qualificationRequirements',
    label: 'Requisitos de qualificação',
    input: 'textarea',
    required: true,
    placeholder:
      'Defina documentos, atestados, registros e comprovações exigidos…',
    autocomplete: 'off',
  },
  paymentConditions: {
    id: 'paymentConditions',
    label: 'Pagamento',
    input: 'textarea',
    required: true,
    placeholder:
      'Descreva medição, aceite, documentos e condição de pagamento…',
    autocomplete: 'off',
  },
  contractingPartyObligations: {
    id: 'contractingPartyObligations',
    label: 'Obrigações do contratante',
    input: 'textarea',
    required: true,
    placeholder:
      'Registre deveres da instituição contratante ao longo da execução…',
    autocomplete: 'off',
  },
  contractorObligations: {
    id: 'contractorObligations',
    label: 'Obrigações da contratada',
    input: 'textarea',
    required: true,
    placeholder:
      'Liste responsabilidades da contratada, equipe, documentação e entrega…',
    autocomplete: 'off',
  },
  contractGovernance: {
    id: 'contractGovernance',
    label: 'Gestão e fiscalização do contrato',
    input: 'textarea',
    required: true,
    placeholder:
      'Defina gestor, fiscalização, registros de acompanhamento e rito de aceite…',
    autocomplete: 'off',
  },
  penalties: {
    id: 'penalties',
    label: 'Penalidade',
    input: 'textarea',
    required: true,
    placeholder:
      'Descreva penalidades, medidas de correção e consequências por descumprimento…',
    autocomplete: 'off',
  },
}

function createInstitutionalTemplate(
  institution: TRInstitution,
  templateType: TRTemplateType,
  label: string,
  intro: string
): TRTemplateDefinition {
  return {
    institution,
    templateType,
    label,
    badge: institution,
    intro,
    fields: institutionalFields,
    sections: [
      {
        id: 'object',
        title: '1. Objeto',
        description:
          'Defina o objeto da contratação com a redação central do TR.',
        kind: 'fields',
        fieldIds: ['object'],
      },
      {
        id: 'justification',
        title: '2. Justificativa',
        description:
          'Contextualize a demanda, o problema e a razão da contratação.',
        kind: 'fields',
        fieldIds: ['justification'],
      },
      {
        id: 'specifications',
        title: '3. Especificações dos Bens ou Serviços',
        description:
          'Estruture escopo, período, modalidade, carga horária, etapas e entregáveis.',
        kind: 'fields',
        fieldIds: [
          'serviceSummary',
          'programPeriod',
          'deliveryMode',
          'workload',
          'scopeSteps',
          'finalDeliverables',
        ],
      },
      {
        id: 'delivery-location',
        title: '4. Locais de Entrega ou Realização',
        description:
          'Informe as unidades, endereços, formato de execução e logística.',
        kind: 'fields',
        fieldIds: ['deliveryLocation'],
      },
      {
        id: 'monitoring',
        title: '5. Acompanhamento da Execução',
        description:
          'Defina responsável, área, contato e observações do acompanhamento.',
        kind: 'fields',
        fieldIds: [
          'monitoringArea',
          'monitoringResponsible',
          'monitoringEmail',
          'monitoringNotes',
        ],
      },
      {
        id: 'requirements',
        title: '6. Requisitos para Contratação',
        description:
          'Registre exigências técnicas, experiência, documentação e condicionantes.',
        kind: 'fields',
        fieldIds: ['hiringRequirements'],
      },
      {
        id: 'payment',
        title: '7. Forma de Pagamento & Condições Gerais',
        description:
          'Estruture marcos de pagamento, faturamento e condições complementares.',
        kind: 'fields',
        fieldIds: ['paymentMilestones', 'invoiceGuidance', 'generalConditions'],
      },
      {
        id: 'review',
        title: 'Revisão final',
        description:
          'Valide a prévia consolidada antes de encaminhar o documento.',
        kind: 'review',
      },
    ],
  }
}

export const trTemplateDefinitions: TRTemplateDefinition[] = [
  createInstitutionalTemplate(
    'FIEPE',
    'consultoria',
    'Consultoria',
    'Modelo FIEPE para consultorias com objeto, justificativa, escopo detalhado, acompanhamento e condições de faturamento.'
  ),
  createInstitutionalTemplate(
    'FIEPE',
    'locacao_maquinas_equipamentos',
    'Locação de máquinas e equipamentos',
    'Modelo FIEPE para locação de ativos e serviços associados, com estrutura documental oficial.'
  ),
  createInstitutionalTemplate(
    'FIEPE',
    'capacitacoes',
    'Capacitações',
    'Modelo FIEPE para ações formativas com especificações, cronograma e governança do serviço.'
  ),
  createInstitutionalTemplate(
    'IEL',
    'coffee_break',
    'Coffee Break',
    'Modelo IEL alinhado à estrutura FIEPE, com preenchimento por seções oficiais do TR.'
  ),
  createInstitutionalTemplate(
    'IEL',
    'instrutoria',
    'Instrutoria',
    'Modelo IEL alinhado à estrutura FIEPE, com detalhamento de escopo, acompanhamento e faturamento.'
  ),
  createInstitutionalTemplate(
    'IEL',
    'servicos_graficos',
    'Serviços gráficos',
    'Modelo IEL alinhado à estrutura FIEPE, adequado a produção gráfica e entregas por unidade.'
  ),
  {
    institution: 'SESI',
    templateType: 'modelo_oficial_sesi',
    label: 'Modelo oficial SESI',
    badge: 'SESI',
    intro:
      'Modelo SESI com objeto próprio, justificativas, matriz de lotes, tabela de unidades e governança contratual detalhada.',
    fields: sesiFields,
    sections: [
      {
        id: 'object',
        title: '1. Do Objeto',
        description:
          'Defina o objeto oficial da contratação antes dos demais fundamentos.',
        kind: 'fields',
        fieldIds: ['object'],
      },
      {
        id: 'objectives',
        title: '2. Justificativas',
        description:
          'Consolide objetivo, justificativa da contratação e critério de agrupamento em lotes.',
        kind: 'fields',
        fieldIds: [
          'objective',
          'hiringJustification',
          'lotGroupingJustification',
        ],
      },
      {
        id: 'specifications',
        title: '3. Especificações Técnicas & Fornecimento',
        description:
          'Documente requisitos técnicos, garantia, prazos, instalação e regras operacionais.',
        kind: 'fields',
        fieldIds: [
          'technicalSpecifications',
          'warrantyConditions',
          'deliveryInstallTerm',
          'installationWindow',
          'operationalNotes',
        ],
      },
      {
        id: 'lots',
        title: '4. Matriz de Lotes',
        description:
          'Estruture lote, unidade/endereço, item, especificação, unidade de medida, quantidade e entrega.',
        kind: 'lots',
      },
      {
        id: 'deliveries',
        title: '5. Instituição/Unidade & Endereços',
        description:
          'Cadastre a tabela auxiliar de instituições, CNPJ e endereços oficiais.',
        kind: 'deliveries',
      },
      {
        id: 'contractual',
        title: '6. Condições Contratuais',
        description:
          'Complete amostra, vigência, orçamento, proposta, qualificação, pagamento, obrigações, fiscalização e penalidades.',
        kind: 'fields',
        fieldIds: [
          'sampleRequirement',
          'contractTerm',
          'budgetResources',
          'proposalRequirements',
          'qualificationRequirements',
          'paymentConditions',
          'contractingPartyObligations',
          'contractorObligations',
          'contractGovernance',
          'penalties',
        ],
      },
      {
        id: 'review',
        title: 'Revisão final',
        description:
          'Revise a prévia oficial consolidada do modelo SESI antes de enviar.',
        kind: 'review',
      },
    ],
  },
]

export function getTemplateDefinition(
  institution: TRInstitution,
  templateType: TRTemplateType
) {
  return (
    trTemplateDefinitions.find(
      (template) =>
        template.institution === institution &&
        template.templateType === templateType
    ) ?? trTemplateDefinitions[0]
  )
}

export function getTemplateOptions(institution: TRInstitution) {
  return trTemplateDefinitions
    .filter((template) => template.institution === institution)
    .map((template) => ({
      label: template.label,
      value: template.templateType,
    }))
}

export function createEmptyLotItem(): TRLotItem {
  return {
    id: createStableId('item'),
    location: '',
    itemCode: '',
    summary: '',
    unitMeasure: '',
    quantity: '',
    delivery: '',
  }
}

export function createEmptyLot(): TRLot {
  return {
    id: createStableId('lot'),
    number: '',
    name: '',
    items: [createEmptyLotItem()],
  }
}

export function createEmptyDeliveryLocation(): TRDeliveryLocation {
  return {
    id: createStableId('delivery'),
    institutionUnit: '',
    cnpj: '',
    address: '',
  }
}

export function createDocumentData(
  template: TRTemplateDefinition,
  previousData?: TRDocumentData
): TRDocumentData {
  const nextData: TRDocumentData = {}

  Object.keys(template.fields).forEach((fieldId) => {
    const previousValue = previousData?.[fieldId]
    nextData[fieldId] = typeof previousValue === 'string' ? previousValue : ''
  })

  if (template.sections.some((section) => section.kind === 'lots')) {
    const previousLots = previousData?.lots
    nextData.lots =
      Array.isArray(previousLots) && previousLots.length
        ? previousLots
        : [createEmptyLot()]
  }

  if (template.sections.some((section) => section.kind === 'deliveries')) {
    const previousDeliveries = previousData?.deliveries
    nextData.deliveries =
      Array.isArray(previousDeliveries) && previousDeliveries.length
        ? previousDeliveries
        : [createEmptyDeliveryLocation()]
  }

  return nextData
}

export function buildReviewState(
  context: { title: string; responsibleUnit: string },
  template: TRTemplateDefinition,
  documentData: TRDocumentData
): TRReviewState {
  const pendingLabels: string[] = []
  let totalRequired = 2

  if (!hasValue(context.title)) pendingLabels.push('Título da TR')
  if (!hasValue(context.responsibleUnit))
    pendingLabels.push('Unidade responsável')

  Object.values(template.fields).forEach((field) => {
    if (!field.required) return
    totalRequired += 1
    if (!hasValue(documentData[field.id])) {
      pendingLabels.push(field.label)
    }
  })

  if (template.sections.some((section) => section.kind === 'lots')) {
    totalRequired += 1
    const lots = (documentData.lots as TRLot[] | undefined) ?? []
    if (!lots.length || lots.every((lot) => !isLotMeaningful(lot))) {
      pendingLabels.push('Ao menos um lote preenchido')
    } else {
      lots.forEach((lot, lotIndex) => {
        if (!hasValue(lot.number))
          pendingLabels.push(`Lote ${lotIndex + 1}: número do lote`)
        if (!hasValue(lot.name))
          pendingLabels.push(`Lote ${lotIndex + 1}: nome do lote`)
        if (!lot.items.length) {
          pendingLabels.push(`Lote ${lotIndex + 1}: ao menos um item`)
          return
        }

        lot.items.forEach((item, itemIndex) => {
          const prefix = `Lote ${lotIndex + 1}, item ${itemIndex + 1}`
          if (!hasValue(item.location))
            pendingLabels.push(`${prefix}: unidade/endereço`)
          if (!hasValue(item.itemCode))
            pendingLabels.push(`${prefix}: identificação do item`)
          if (!hasValue(item.summary))
            pendingLabels.push(`${prefix}: especificação resumida`)
          if (!hasValue(item.unitMeasure))
            pendingLabels.push(`${prefix}: unidade de medida`)
          if (!hasValue(item.quantity))
            pendingLabels.push(`${prefix}: quantidade total`)
          if (!hasValue(item.delivery)) pendingLabels.push(`${prefix}: entrega`)
        })
      })
    }
  }

  if (template.sections.some((section) => section.kind === 'deliveries')) {
    totalRequired += 1
    const deliveries =
      (documentData.deliveries as TRDeliveryLocation[] | undefined) ?? []
    if (
      !deliveries.length ||
      deliveries.every((entry) => !isDeliveryMeaningful(entry))
    ) {
      pendingLabels.push('Ao menos uma instituição/unidade preenchida')
    } else {
      deliveries.forEach((entry, index) => {
        if (!hasValue(entry.institutionUnit)) {
          pendingLabels.push(`Instituição/unidade ${index + 1}`)
        }
        if (!hasValue(entry.cnpj)) pendingLabels.push(`CNPJ ${index + 1}`)
        if (!hasValue(entry.address))
          pendingLabels.push(`Endereço ${index + 1}`)
      })
    }
  }

  return {
    totalRequired,
    completedRequired: Math.max(totalRequired - pendingLabels.length, 0),
    pendingLabels,
    isReady: pendingLabels.length === 0,
  }
}

export function buildDocumentSections(
  context: {
    institution: TRInstitution
    responsibleUnit: string
    title: string
    templateType: TRTemplateType
  },
  template: TRTemplateDefinition,
  documentData: TRDocumentData
): TRDocumentSection[] {
  const sections: TRDocumentSection[] = [
    {
      kind: 'keyValue',
      title: 'Contexto do documento',
      items: [
        { label: 'Instituição', value: context.institution },
        { label: 'Modelo', value: template.label },
        { label: 'Unidade responsável', value: context.responsibleUnit },
      ],
    },
  ]

  template.sections.forEach((section) => {
    if (section.kind === 'fields') {
      const fieldIds = section.fieldIds ?? []
      const fields = fieldIds
        .map((fieldId) => template.fields[fieldId])
        .filter(Boolean)

      if (!fields.length) return

      if (fields.length === 1 && fields[0]?.input === 'textarea') {
        const field = fields[0]
        const content = String(documentData[field.id] ?? '')
        if (hasValue(content)) {
          sections.push({
            kind: 'prose',
            title: section.title,
            content,
          })
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
        sections.push({
          kind: 'keyValue',
          title: section.title,
          items,
        })
      }
      return
    }

    if (section.kind === 'lots') {
      const lots = ((documentData.lots as TRLot[] | undefined) ?? []).filter(
        isLotMeaningful
      )
      const rows = lots.flatMap((lot) =>
        lot.items
          .filter(isLotItemMeaningful)
          .map((item) => [
            lot.number || '—',
            lot.name || '—',
            item.location || '—',
            item.itemCode || '—',
            item.summary || '—',
            item.unitMeasure || '—',
            item.quantity || '—',
            item.delivery || '—',
          ])
      )

      sections.push({
        kind: 'table',
        title: 'Matriz de lotes',
        columns: [
          'Nº lote',
          'Lote',
          'Unidade/Endereço',
          'Item',
          'Especificação resumida',
          'Unidade de medida',
          'Qtd. total',
          'Entrega',
        ],
        rows,
        emptyMessage: 'Nenhuma linha de lote foi estruturada até o momento.',
      })
      return
    }

    if (section.kind === 'deliveries') {
      const deliveries = (
        (documentData.deliveries as TRDeliveryLocation[] | undefined) ?? []
      ).filter(isDeliveryMeaningful)

      sections.push({
        kind: 'table',
        title: 'Instituição/Unidade, CNPJ e endereço',
        columns: ['Instituição/Unidade', 'CNPJ', 'Endereço'],
        rows: deliveries.map((entry) => [
          entry.institutionUnit || '—',
          entry.cnpj || '—',
          entry.address || '—',
        ]),
        emptyMessage: 'Nenhuma instituição/unidade cadastrada até o momento.',
      })
    }
  })

  return sections
}

export function hasMeaningfulData(documentData: TRDocumentData) {
  return Object.values(documentData).some((value) => {
    if (typeof value === 'string') return hasValue(value)
    if (Array.isArray(value)) {
      return value.some((entry) => {
        if ('items' in entry) {
          return isLotMeaningful(entry)
        }
        return isDeliveryMeaningful(entry as TRDeliveryLocation)
      })
    }
    return false
  })
}

export function getDefaultTemplateForInstitution(
  institution: TRInstitution
): TRTemplateType {
  return getTemplateOptions(institution)[0]?.value ?? 'consultoria'
}

export function getInstitutionOptions() {
  return trInstitutions.map((institution) => ({
    label: institution,
    value: institution,
  }))
}

export function getResponsibleUnitOptions() {
  return unitOptions
}

function createStableId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function hasValue(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

function isLotItemMeaningful(item: TRLotItem) {
  return [
    item.location,
    item.itemCode,
    item.summary,
    item.unitMeasure,
    item.quantity,
    item.delivery,
  ].some(hasValue)
}

function isLotMeaningful(lot: TRLot) {
  return (
    [lot.number, lot.name].some(hasValue) || lot.items.some(isLotItemMeaningful)
  )
}

function isDeliveryMeaningful(entry: TRDeliveryLocation) {
  return [entry.institutionUnit, entry.cnpj, entry.address].some(hasValue)
}
