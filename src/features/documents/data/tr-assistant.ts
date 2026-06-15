import {
  type DocumentData,
  type FieldDefinition,
  type SectionDefinition,
  type ModelDefinition,
} from '@/features/documents/data/templates'
import { type TRWizardContext } from '@/features/documents/wizard/types'

export type TRAssistantAction = 'suggest' | 'expand' | 'rewrite'

export const trAssistantActionLabels: Record<TRAssistantAction, string> = {
  suggest: 'Sugerir',
  expand: 'Expandir',
  rewrite: 'Reescrever',
}

export const trAssistantActionDescriptions: Record<TRAssistantAction, string> =
  {
    suggest:
      'Cria um texto base do zero para destravar o preenchimento deste campo.',
    expand:
      'Acrescenta densidade, contexto e detalhamento no que você já escreveu.',
    rewrite:
      'Reformula o texto atual para melhorar clareza e padronização institucional.',
  }

export type TRAssistantTarget = {
  fieldId: string
  sectionId: string
}

export type TRAssistantSuggestion = {
  fieldId: string
  sectionId: string
  action: TRAssistantAction
  title: string
  content: string
  note?: string
}

export type TRAssistantRequest = {
  context: TRWizardContext
  template: ModelDefinition
  currentSection: SectionDefinition
  fieldId: string
  documentData: DocumentData
  action: TRAssistantAction
}

export type TRAssistantSupport = 'narrative' | 'short' | 'cadastral'

/**
 * Identifica o nível de assistência que faz sentido para um campo.
 * Apenas campos narrativos recebem suggest/expand/rewrite completos.
 */
export function getFieldSupport(
  field: FieldDefinition | undefined
): TRAssistantSupport {
  if (!field) return 'cadastral'
  if (field.input === 'textarea') return 'narrative'
  if (
    field.input === 'select' ||
    field.input === 'date' ||
    field.input === 'email'
  ) {
    return 'cadastral'
  }
  return 'short'
}

type FieldRecipe = {
  suggest: { title: string; content: string; note?: string }
  expand?: { title: string; content: string; note?: string }
  rewrite?: { title: string; content: string; note?: string }
}

type TemplateFamily = 'fiepe-iel' | 'sesi'

function familyForContext(context: TRWizardContext): TemplateFamily {
  // O tom da sugestão segue o tipo de documento: o TR (artefato final, mais
  // operacional) usa o conjunto SESI; DFD e ETP usam o conjunto fiepe-iel.
  if (context.docType === 'tr') return 'sesi'
  return 'fiepe-iel'
}

const fiepeIelRecipes: Record<string, FieldRecipe> = {
  object: {
    suggest: {
      title: 'Objeto institucional FIEPE/IEL',
      content:
        'Contratação de serviço especializado para apoiar a {unidade} na execução do programa "{titulo}", com entregas formais validadas pela área demandante e aderência aos procedimentos do Sistema FIEPE.',
      note: 'Preencha {titulo} e {unidade} com base no contexto do TR.',
    },
    expand: {
      title: 'Objeto detalhado',
      content:
        'Contratação de serviço especializado, com escopo previamente acordado, para apoiar a {unidade} na execução do programa "{titulo}". O fornecimento contempla planejamento, execução acompanhada, entregas formais por marco e aceite final pela área técnica, observando o padrão FIEPE/IEL para gestão de contratos.',
    },
    rewrite: {
      title: 'Objeto reescrito (tom institucional)',
      content:
        'Contratação de pessoa jurídica especializada para apoiar tecnicamente a {unidade} na execução do programa "{titulo}", em conformidade com os procedimentos vigentes do Sistema FIEPE e com aceite formal por etapa.',
    },
  },
  justification: {
    suggest: {
      title: 'Justificativa-base',
      content:
        'A {unidade} demanda apoio especializado externo para conduzir o programa "{titulo}" com a profundidade técnica necessária, em um prazo compatível com o cronograma institucional. A contratação se justifica pela limitação de capacidade interna disponível e pelo grau de especialização exigido pela entrega.',
    },
    expand: {
      title: 'Justificativa detalhada',
      content:
        'A {unidade} identificou a necessidade de apoio especializado externo para conduzir o programa "{titulo}" porque (a) a expertise requerida não está disponível em volume suficiente na equipe interna no horizonte do cronograma; (b) o objeto exige metodologia específica e visão independente para evitar viés institucional; (c) a operação atual da unidade não absorveria essa demanda sem comprometer atividades em curso. A contratação garante velocidade, qualidade técnica e aderência ao padrão FIEPE.',
    },
    rewrite: {
      title: 'Justificativa reescrita',
      content:
        'Justifica-se a contratação pela necessidade de apoio técnico especializado para a execução do programa "{titulo}" pela {unidade}, considerando a maturidade exigida, o cronograma institucional e a indisponibilidade equivalente de capacidade interna no período.',
    },
  },
  serviceSummary: {
    suggest: {
      title: 'Resumo executivo do serviço',
      content:
        'O serviço deve cobrir planejamento, execução técnica acompanhada, entregas formais por marco e validação com a {unidade}, mantendo o ritmo institucional combinado e a documentação consolidada para a revisão jurídica.',
    },
    expand: {
      title: 'Resumo executivo ampliado',
      content:
        'O serviço deve cobrir: (1) planejamento detalhado e alinhamento inicial com a {unidade}; (2) execução técnica acompanhada por ritos de status; (3) entregas formais por marco com aceite documentado; (4) validação final por instância competente. Ao longo da execução, espera-se documentação consolidada, comunicação proativa e aderência ao cronograma acordado.',
    },
    rewrite: {
      title: 'Resumo executivo reescrito',
      content:
        'A prestação contempla planejamento, execução técnica acompanhada, entregas por marco e aceite final pela {unidade}, com documentação institucional consolidada ao longo do contrato.',
    },
  },
  scopeSteps: {
    suggest: {
      title: 'Escopo em etapas (template inicial)',
      content:
        '1. Kick-off e alinhamento executivo com a {unidade}.\n2. Levantamento documental e diagnóstico inicial.\n3. Entrevistas com áreas-chave.\n4. Oficina de priorização.\n5. Consolidação do diagnóstico.\n6. Desenho do plano de ação.\n7. Apresentação final com aceite formal.',
    },
    expand: {
      title: 'Escopo em etapas (expandido)',
      content:
        '1. Kick-off com a {unidade}: pactuação de premissas, papéis e cronograma.\n2. Levantamento documental: revisão de materiais existentes e bibliografia interna.\n3. Entrevistas com áreas-chave: validação qualitativa de hipóteses.\n4. Diagnóstico consolidado: síntese de achados, gaps e oportunidades.\n5. Oficina de priorização com lideranças.\n6. Desenho do plano de ação: marcos, responsáveis e métricas.\n7. Apresentação final para a diretoria com aceite formal.',
    },
    rewrite: {
      title: 'Escopo reescrito',
      content:
        'Etapas previstas: alinhamento inicial, levantamento documental, entrevistas técnicas, diagnóstico consolidado, priorização, desenho do plano de ação e apresentação final, todas com aceite formal pela {unidade}.',
    },
  },
  finalDeliverables: {
    suggest: {
      title: 'Entregáveis finais',
      content:
        'Relatório executivo consolidado, plano de ação com responsáveis e prazos, materiais de apresentação para a diretoria e arquivos-fonte editáveis utilizados durante a execução.',
    },
    expand: {
      title: 'Entregáveis finais (detalhado)',
      content:
        'Relatório executivo consolidado em formato editável, plano de ação com marcos, responsáveis e métricas mensuráveis, materiais de apresentação preparados para a diretoria, arquivos-fonte de todas as oficinas e entrevistas, e um sumário de continuidade indicando próximos passos pós-contrato.',
    },
  },
  hiringRequirements: {
    suggest: {
      title: 'Requisitos de contratação (FIEPE/IEL)',
      content:
        'Comprovação de experiência prévia em projetos de natureza equivalente, portfólio com casos similares, equipe técnica sênior atribuída ao contrato, disponibilidade para o cronograma e regularidade fiscal exigida pelo Sistema FIEPE.',
    },
    rewrite: {
      title: 'Requisitos reescritos',
      content:
        'A contratada deve comprovar experiência em objetos similares, apresentar portfólio coerente, alocar equipe sênior dedicada, atender ao cronograma proposto e manter a regularidade fiscal exigida pelo Sistema FIEPE durante toda a vigência.',
    },
  },
  monitoringNotes: {
    suggest: {
      title: 'Observações de acompanhamento',
      content:
        'A execução será acompanhada por ritos quinzenais com a {unidade}, validação formal de marcos, registro institucional dos aceites e abertura imediata de tratativas em caso de desvio de escopo, prazo ou qualidade.',
    },
  },
  paymentMilestones: {
    suggest: {
      title: 'Marcos de pagamento',
      content:
        'Pagamentos em parcelas vinculadas à entrega validada por marco, mediante aceite formal da {unidade} e atendimento das condições contratuais, conforme cronograma anexo ao contrato.',
    },
    rewrite: {
      title: 'Marcos reescritos',
      content:
        'O pagamento será efetuado por marco entregue e formalmente aceito pela {unidade}, conforme cronograma e condições estabelecidos em contrato.',
    },
  },
  generalConditions: {
    suggest: {
      title: 'Condições gerais',
      content:
        'Entregas sujeitas a validação formal pela {unidade}, com possibilidade de ajustes antes do aceite final. Vigência e demais cláusulas seguem o padrão institucional do Sistema FIEPE aplicável a este modelo.',
    },
  },
  invoiceGuidance: {
    suggest: {
      title: 'Diretrizes de faturamento',
      content:
        'A nota fiscal deve referenciar o instrumento contratual, o programa "{titulo}", o marco entregue e a {unidade} demandante, com descrição clara do escopo realizado no período.',
    },
  },
  programPeriod: {
    suggest: {
      title: 'Período de execução',
      content:
        'Sugestão: defina mês de início e fim observando o cronograma anual da {unidade} e os marcos de entrega previstos. Ex.: "Agosto a novembro de 2026".',
    },
  },
  workload: {
    suggest: {
      title: 'Carga horária estimada',
      content:
        'Sugestão: informe a carga total em horas, alinhada com a complexidade do escopo. Ex.: "64 horas" para consultorias de 3 a 4 meses com 2 a 3 oficinas.',
    },
  },
  marketResearch: {
    suggest: {
      title: 'Levantamento de mercado',
      content:
        'Para "{titulo}", foram consultadas contratações públicas anteriores (inclusive no Portal Nacional de Contratações Públicas - PNCP) e referências de preço de fornecedores. A pesquisa indica faixa estimada entre R$ X e R$ Y por unidade. Alternativas consideradas: (1) ...; (2) ...; (3) .... A opção mais vantajosa para a {unidade} é ..., por equilibrar custo, prazo e qualidade.',
      note: 'Substitua X, Y e as alternativas pelos dados reais da pesquisa.',
    },
    expand: {
      title: 'Levantamento de mercado detalhado',
      content:
        'O levantamento para "{titulo}" combinou três fontes: (a) contratações similares no PNCP e em outros entes; (b) cotações diretas com fornecedores do ramo; (c) o histórico de aquisições da {unidade}. A faixa de preços observada foi de R$ X a R$ Y, com mediana em R$ Z. As alternativas foram avaliadas quanto a custo total, prazo de entrega, garantia e capacidade de atendimento, o que fundamenta a solução adotada e a estimativa de valor.',
    },
  },
}

const sesiRecipes: Record<string, FieldRecipe> = {
  object: {
    suggest: {
      title: 'Objeto SESI',
      content:
        'Aquisição/contratação para atender à demanda "{titulo}" da {unidade}, em estrita conformidade com o modelo oficial SESI, com lotes, especificações técnicas e condições contratuais formalmente definidos.',
    },
    rewrite: {
      title: 'Objeto reescrito (SESI)',
      content:
        'Objeto: atendimento à demanda "{titulo}" pela {unidade}, conforme padrão SESI e respectivos lotes definidos neste TR.',
    },
  },
  objective: {
    suggest: {
      title: 'Objetivo do contrato',
      content:
        'Garantir o atendimento técnico e operacional adequado da {unidade} para o objeto descrito, observando lotes, especificações e cronograma estabelecidos neste TR.',
    },
  },
  hiringJustification: {
    suggest: {
      title: 'Justificativa da contratação SESI',
      content:
        'A {unidade} identifica a necessidade de atendimento por terceiro especializado para o objeto descrito, em razão (a) da especialização exigida; (b) do volume e prazo incompatíveis com a capacidade interna; (c) do enquadramento no modelo oficial SESI para esse tipo de contratação.',
    },
    expand: {
      title: 'Justificativa SESI detalhada',
      content:
        'A {unidade} demanda atendimento técnico especializado por terceiro para o objeto descrito, considerando: a especialização requerida; o volume e prazo incompatíveis com a capacidade interna; o enquadramento no modelo oficial SESI; a necessidade de continuidade operacional sem interrupção dos atendimentos atuais; e o histórico institucional de contratações análogas que demonstram a adequação do formato.',
    },
  },
  lotGroupingJustification: {
    suggest: {
      title: 'Justificativa do agrupamento em lotes',
      content:
        'Os lotes foram organizados por afinidade técnica e logística, otimizando a operação da {unidade}, garantindo economicidade na disputa e mantendo a viabilidade de execução por fornecedor especializado em cada conjunto.',
    },
  },
  technicalSpecifications: {
    suggest: {
      title: 'Especificações técnicas',
      content:
        'As especificações técnicas dos itens estão detalhadas na matriz de lotes deste TR, incluindo unidade de medida, quantidade total, condições de entrega, garantia mínima e demais critérios técnicos exigidos pelo SESI.',
      note: 'A matriz de lotes complementa este campo. Preencha o step "Lotes" para consolidar.',
    },
    rewrite: {
      title: 'Especificações reescritas',
      content:
        'Vide matriz de lotes anexa: cada item traz unidade de medida, quantidade total, condições de entrega e garantia, conforme o padrão SESI.',
    },
  },
  warrantyConditions: {
    suggest: {
      title: 'Condições de garantia',
      content:
        'Garantia mínima conforme legislação aplicável e padrão SESI, com atendimento técnico durante a vigência, substituição em caso de não conformidade e prazos de resposta definidos em contrato.',
    },
  },
  deliveryInstallTerm: {
    suggest: {
      title: 'Prazo de entrega e instalação',
      content:
        'Prazos de entrega e instalação por lote, contados a partir da emissão da ordem de fornecimento pela {unidade}, com janelas de execução validadas previamente.',
    },
  },
  installationWindow: {
    suggest: {
      title: 'Janela de instalação',
      content:
        'Execução em janelas previamente acordadas com a {unidade}, em horário compatível com o funcionamento da unidade e sem prejuízo às atividades regulares.',
    },
  },
  operationalNotes: {
    suggest: {
      title: 'Notas operacionais',
      content:
        'A contratada deve respeitar protocolos internos da {unidade}, normas de segurança aplicáveis e procedimentos de comunicação institucional durante toda a execução.',
    },
  },
  sampleRequirement: {
    suggest: {
      title: 'Exigência de amostra',
      content:
        'Apresentação de amostra técnica conforme padrão SESI, sujeita a análise pela equipe responsável da {unidade} antes da homologação do fornecedor.',
    },
  },
  contractTerm: {
    suggest: {
      title: 'Vigência contratual',
      content:
        'Vigência conforme padrão SESI para o objeto, com possibilidade de prorrogação justificada e renovação dentro dos limites estabelecidos pela política institucional.',
    },
  },
  budgetResources: {
    suggest: {
      title: 'Recursos orçamentários',
      content:
        'Despesa custeada por dotação orçamentária específica da {unidade}, conforme planejamento financeiro e código contábil aplicáveis ao exercício.',
    },
  },
  proposalRequirements: {
    suggest: {
      title: 'Requisitos da proposta',
      content:
        'A proposta deve contemplar especificações técnicas integrais, preço total e por lote, condições comerciais, prazo de validade e regularidade fiscal, conforme padrão SESI.',
    },
  },
  qualificationRequirements: {
    suggest: {
      title: 'Requisitos de habilitação',
      content:
        'Habilitação jurídica, regularidade fiscal e trabalhista, qualificação técnica compatível e qualificação econômico-financeira nos termos do modelo SESI vigente.',
    },
  },
  paymentConditions: {
    suggest: {
      title: 'Condições de pagamento',
      content:
        'Pagamento conforme cronograma vinculado à entrega validada por lote, mediante aceite formal da {unidade} e atendimento das condições contratuais SESI.',
    },
  },
  contractingPartyObligations: {
    suggest: {
      title: 'Obrigações do contratante (SESI)',
      content:
        'O SESI obriga-se a fornecer informações necessárias, validar entregas dentro do prazo previsto, efetuar pagamentos conforme contrato e indicar interlocutor responsável pela {unidade}.',
    },
  },
  contractorObligations: {
    suggest: {
      title: 'Obrigações do contratado (SESI)',
      content:
        'A contratada obriga-se a cumprir o objeto conforme especificações, manter regularidade documental durante a vigência, atender prazos de execução e responder por danos decorrentes da prestação.',
    },
  },
  contractGovernance: {
    suggest: {
      title: 'Gestão e fiscalização',
      content:
        'Gestão pela {unidade}, com fiscal designado, ritos formais de acompanhamento, registro de aceites e tratativa imediata de não conformidades conforme padrão SESI.',
    },
  },
  penalties: {
    suggest: {
      title: 'Penalidades',
      content:
        'Em caso de inexecução total ou parcial, aplicam-se as penalidades previstas no padrão SESI, observado o contraditório e a ampla defesa antes de qualquer sanção.',
    },
  },
  items: {
    suggest: {
      title: 'Itens e quantidades',
      content:
        'Itens estimados para "{titulo}" (preços de referência da pesquisa de mercado):\n1. [Descrição do item] - Unidade: un - Quantidade: 10 - Preço unitário: R$ 500,00 - Total: R$ 5.000,00\n2. [Descrição do item] - Unidade: serviço - Quantidade: 4 - Preço unitário: R$ 1.200,00 - Total: R$ 4.800,00\n3. [Descrição do item] - Unidade: mês - Quantidade: 12 - Preço unitário: R$ 800,00 - Total: R$ 9.600,00\nValor total estimado: R$ 19.400,00.',
      note: 'Ajuste descrições, unidades, quantidades e preços conforme o objeto e a pesquisa.',
    },
    expand: {
      title: 'Itens com critérios de medição',
      content:
        'Para cada item da contratação de "{titulo}", além de descrição, unidade, quantidade e preço unitário/total, defina o critério de medição e aceite:\n- Item 1: medido por entrega aceita pela {unidade}, com pagamento após atesto.\n- Item 2: medido por etapa concluída conforme o cronograma.\n- Item 3: medido por mês de prestação efetiva.\nObserve a modalidade aplicável e a faixa de preços do levantamento de mercado.',
    },
  },
}

function applyTemplateVars(
  text: string,
  context: TRWizardContext,
  template: ModelDefinition
): string {
  return text
    .replace(/\{titulo\}/g, context.title || 'a contratação')
    .replace(/\{unidade\}/g, context.responsibleUnit || 'unidade demandante')
    .replace(/\{modelo\}/g, template.label)
}

function fallbackContent(
  field: FieldDefinition,
  action: TRAssistantAction,
  family: TemplateFamily
): { title: string; content: string; note?: string } {
  const institutionLabel = family === 'sesi' ? 'SESI' : 'FIEPE/IEL'
  if (action === 'suggest') {
    return {
      title: `Texto-base para "${field.label}"`,
      content: `Sugestão genérica para "${field.label}" no padrão ${institutionLabel}. Ajuste com o contexto específico da sua contratação antes de aplicar.`,
      note: 'Sem regra dedicada para este campo. Padrão genérico aplicado.',
    }
  }
  if (action === 'expand') {
    return {
      title: `Expandir "${field.label}"`,
      content: `Considere acrescentar contexto institucional, justificativa específica e referência ao padrão ${institutionLabel} para enriquecer o conteúdo deste campo.`,
    }
  }
  return {
    title: `Reescrever "${field.label}"`,
    content: `Reescrita sugerida para "${field.label}" mantendo o tom institucional do padrão ${institutionLabel}, com clareza e padronização.`,
  }
}

/**
 * Gera uma sugestão determinística para o campo solicitado.
 * Mesma entrada produz sempre a mesma saída.
 */
export function generateAssistantSuggestion(
  request: TRAssistantRequest
): TRAssistantSuggestion | null {
  const { context, template, currentSection, fieldId, action } = request
  const field = template.fields[fieldId]
  if (!field) return null

  const support = getFieldSupport(field)
  if (support === 'cadastral') return null

  const family = familyForContext(context)
  const recipes = family === 'sesi' ? sesiRecipes : fiepeIelRecipes
  const recipe = recipes[fieldId]

  const actionRecipe = recipe?.[action]
  const suggestFallback = action !== 'suggest' ? recipe?.suggest : undefined
  const base =
    actionRecipe ?? suggestFallback ?? fallbackContent(field, action, family)

  return {
    fieldId,
    sectionId: currentSection.id,
    action,
    title: base.title,
    content: applyTemplateVars(base.content, context, template),
    note: base.note,
  }
}

export type TRAssistantStatus = 'idle' | 'generating' | 'ready' | 'error'

export type TRAssistantState = {
  target: TRAssistantTarget | null
  status: TRAssistantStatus
  suggestion: TRAssistantSuggestion | null
  error: string | null
}

export function createInitialAssistantState(): TRAssistantState {
  return {
    target: null,
    status: 'idle',
    suggestion: null,
    error: null,
  }
}
