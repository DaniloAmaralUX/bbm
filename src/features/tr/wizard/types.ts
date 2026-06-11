import {
  type TRDocumentData,
  type TRInstitution,
  type TRReviewState,
  type TRTemplateDefinition,
  type TRTemplateType,
  buildReviewState,
  createDocumentData,
  getDefaultTemplateForInstitution,
  getTemplateDefinition,
} from '@/features/tr/data/templates'

export type TRWizardSubmissionStatus = 'editing' | 'submitting' | 'completed'

export type TRWizardContext = {
  institution: TRInstitution
  templateType: TRTemplateType
  title: string
  responsibleUnit: string
  referenceCode: string
}

export type TRWizardData = {
  currentStep: number
  submission: {
    status: TRWizardSubmissionStatus
    savedAt: string
    completedAt: string
  }
  context: TRWizardContext
  documentData: TRDocumentData
  reviewState: TRReviewState
  isDirty: boolean
}

export function getCurrentTemplate(
  context: TRWizardContext
): TRTemplateDefinition {
  return getTemplateDefinition(context.institution, context.templateType)
}

export function createInitialTRWizardData(): TRWizardData {
  const institution: TRInstitution = 'FIEPE'
  const templateType = getDefaultTemplateForInstitution(institution)
  const template = getTemplateDefinition(institution, templateType)

  const context: TRWizardContext = {
    institution,
    templateType,
    title: 'Consultoria para desenho do programa de produtividade industrial',
    responsibleUnit: 'Sede Recife',
    referenceCode: 'TR-2026-021',
  }

  const documentData = createDocumentData(template, {
    object:
      'Contratação de consultoria especializada para estruturar um programa de produtividade industrial com diagnóstico, direcionamento executivo e plano de ação.',
    justification:
      'A unidade precisa consolidar uma visão técnica independente para priorizar gargalos operacionais, orientar a diretoria e acelerar ganhos de eficiência.',
    serviceSummary:
      'A consultoria deve apoiar o desenho do programa, consolidar diagnóstico, validar hipóteses com lideranças e traduzir o trabalho em agenda executável.',
    programPeriod: 'Agosto a novembro de 2026',
    deliveryMode: 'hibrida',
    workload: '64 horas',
    scopeSteps:
      '1. Kick-off e alinhamento executivo.\n2. Levantamento documental.\n3. Entrevistas com áreas-chave.\n4. Oficina de priorização.\n5. Consolidação do diagnóstico.\n6. Desenho do plano de ação.\n7. Apresentação final para a diretoria.',
    finalDeliverables:
      'Relatório executivo com diagnóstico, oportunidades priorizadas, cronograma sugerido, responsáveis recomendados e próximos passos.',
    deliveryLocation:
      'Execução híbrida com reuniões presenciais na Sede Recife e entregas digitais para as equipes envolvidas.',
    monitoringArea: 'Unidade de Competitividade Industrial',
    monitoringResponsible: 'Marina Albuquerque',
    monitoringEmail: 'marina.albuquerque@fiepe.org.br',
    monitoringNotes:
      'A execução será acompanhada por ritos quinzenais, validação de marcos e aceite final da liderança responsável.',
    hiringRequirements:
      'A contratada deve comprovar experiência prévia em consultoria industrial, portfólio similar, equipe sênior e disponibilidade para o cronograma definido.',
    paymentMilestones:
      'Pagamento em parcelas por marco validado, condicionado à entrega dos produtos e ao aceite formal da unidade demandante.',
    invoiceGuidance:
      'A nota fiscal deve mencionar o convênio aplicável, o nome do programa e a descrição do marco correspondente.',
    generalConditions:
      'Entregas sujeitas a validação formal da unidade demandante, com possibilidade de ajustes antes do aceite final.',
  })

  return {
    currentStep: 0,
    submission: {
      status: 'editing',
      savedAt: '',
      completedAt: '',
    },
    context,
    documentData,
    reviewState: buildReviewState(context, template, documentData),
    isDirty: false,
  }
}
