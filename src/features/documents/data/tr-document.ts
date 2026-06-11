import { type DocumentSection } from './templates'
import { trs } from './trs'

export function getTRById(trId?: string) {
  return trs.find((item) => item.id === trId) ?? trs[0]
}

// --- Builders de seção (espelham o layout dos templates institucionais/SESI) ---

function prose(title: string, content: string): DocumentSection {
  return { kind: 'prose', title, content }
}

function keyValue(
  title: string,
  pairs: Array<[string, string]>
): DocumentSection {
  return {
    kind: 'keyValue',
    title,
    items: pairs.map(([label, value]) => ({ label, value })),
  }
}

function table(
  title: string,
  columns: string[],
  rows: string[][]
): DocumentSection {
  return { kind: 'table', title, columns, rows }
}

// Trechos genuinamente boilerplate entre contratos — default reaproveitável.
const institutionalDefaults = {
  monitoringNotes:
    'Acompanhamento periódico com validação de marcos, registro de evidências e aceite formal do responsável.',
  invoiceGuidance:
    'A nota fiscal deve identificar o objeto contratado, o período de referência e o número do TR correspondente.',
  generalConditions:
    'Eventuais ajustes necessários ao aceite final deverão ser absorvidos pela contratada, sem custo adicional, dentro do escopo previsto.',
}

type InstitutionalSpec = {
  object: string
  justification: string
  serviceSummary: string
  programPeriod: string
  deliveryMode: string
  workload: string
  scopeSteps: string
  finalDeliverables: string
  deliveryLocation: string
  monitoringArea: string
  monitoringResponsible: string
  monitoringEmail: string
  hiringRequirements: string
  paymentMilestones: string
  monitoringNotes?: string
  invoiceGuidance?: string
  generalConditions?: string
}

function institutionalSections(spec: InstitutionalSpec): DocumentSection[] {
  const s = { ...institutionalDefaults, ...spec }
  return [
    prose('1. Objeto', s.object),
    prose('2. Justificativa', s.justification),
    keyValue('3. Especificações dos Bens ou Serviços', [
      ['Descrição resumida do escopo', s.serviceSummary],
      ['Período de realização', s.programPeriod],
      ['Modalidade', s.deliveryMode],
      ['Carga horária total ou janela operacional', s.workload],
      ['Etapas, escopo detalhado ou itens do serviço', s.scopeSteps],
      ['Entregáveis finais', s.finalDeliverables],
    ]),
    prose('4. Locais de Entrega ou Realização', s.deliveryLocation),
    keyValue('5. Acompanhamento da Execução', [
      ['Área ou unidade responsável pelo acompanhamento', s.monitoringArea],
      ['Responsável pelo acompanhamento', s.monitoringResponsible],
      ['E-mail de acompanhamento', s.monitoringEmail],
      ['Observações de acompanhamento', s.monitoringNotes],
    ]),
    prose('6. Requisitos para Contratação', s.hiringRequirements),
    keyValue('7. Forma de Pagamento & Condições Gerais', [
      ['Forma de pagamento', s.paymentMilestones],
      ['Observações de faturamento e descrição de NF', s.invoiceGuidance],
      ['Condições gerais', s.generalConditions],
    ]),
  ]
}

type AcquisitionLotItem = {
  location: string
  itemCode: string
  summary: string
  unitMeasure: string
  quantity: string
  delivery: string
}

type AcquisitionSpec = {
  object: string
  objective: string
  hiringJustification: string
  lotGroupingJustification: string
  technicalSpecifications: string
  warrantyConditions: string
  deliveryInstallTerm: string
  installationWindow: string
  operationalNotes: string
  lots: Array<{ number: string; name: string; items: AcquisitionLotItem[] }>
  deliveries: Array<{ institutionUnit: string; cnpj: string; address: string }>
  sampleRequirement: string
  contractTerm: string
  budgetResources: string
  proposalRequirements: string
  qualificationRequirements: string
  paymentConditions: string
  contractingPartyObligations: string
  contractorObligations: string
  contractGovernance: string
  penalties: string
}

function acquisitionSections(spec: AcquisitionSpec): DocumentSection[] {
  const lotRows = spec.lots.flatMap((lot) =>
    lot.items.map((item) => [
      lot.number,
      lot.name,
      item.location,
      item.itemCode,
      item.summary,
      item.unitMeasure,
      item.quantity,
      item.delivery,
    ])
  )

  return [
    prose('1. Do Objeto', spec.object),
    keyValue('2. Justificativas', [
      ['Justificativa e objetivo da contratação', spec.objective],
      ['Justificativa da contratação', spec.hiringJustification],
      ['Justificativa para o agrupamento em lotes', spec.lotGroupingJustification],
    ]),
    keyValue('3. Especificações Técnicas & Fornecimento', [
      ['Especificações técnicas e entrega/fornecimento', spec.technicalSpecifications],
      ['Garantia e assistência', spec.warrantyConditions],
      ['Prazos de entrega e instalação', spec.deliveryInstallTerm],
      ['Condições operacionais de instalação', spec.installationWindow],
      ['Observações operacionais complementares', spec.operationalNotes],
    ]),
    table(
      'Matriz de lotes',
      [
        'Nº lote',
        'Lote',
        'Unidade/Endereço',
        'Item',
        'Especificação resumida',
        'Unidade de medida',
        'Qtd. total',
        'Entrega',
      ],
      lotRows
    ),
    table(
      'Instituição/Unidade, CNPJ e endereço',
      ['Instituição/Unidade', 'CNPJ', 'Endereço'],
      spec.deliveries.map((entry) => [
        entry.institutionUnit,
        entry.cnpj,
        entry.address,
      ])
    ),
    keyValue('6. Condições Contratuais', [
      ['Apresentação de amostra', spec.sampleRequirement],
      ['Prazos de vigência', spec.contractTerm],
      ['Recursos orçamentários', spec.budgetResources],
      ['Proposta', spec.proposalRequirements],
      ['Requisitos de qualificação', spec.qualificationRequirements],
      ['Pagamento', spec.paymentConditions],
      ['Obrigações do contratante', spec.contractingPartyObligations],
      ['Obrigações da contratada', spec.contractorObligations],
      ['Gestão e fiscalização do contrato', spec.contractGovernance],
      ['Penalidade', spec.penalties],
    ]),
  ]
}

// --- Conteúdo por TR (corpo alinhado ao título e à natureza de cada documento) ---

type DocumentSpec = { model: string; sections: DocumentSection[] }

const documentSpecs: Record<string, DocumentSpec> = {
  // SENAI · Capacitação — instrutor NR-10
  'TR-2026-014': {
    model: 'Capacitação',
    sections: institutionalSections({
      object:
        'Contratação de instrutor técnico para ministrar turma intensiva da NR-10 (Segurança em Instalações e Serviços em Eletricidade), com carga horária de 40 horas, voltada à qualificação de profissionais de manutenção.',
      justification:
        'A unidade precisa requalificar equipes de manutenção elétrica em conformidade com a NR-10, atendendo exigências legais de segurança e reduzindo riscos operacionais nas instalações.',
      serviceSummary:
        'Planejamento e condução de turma presencial da NR-10, com material didático, avaliação de aprendizagem e emissão de certificados aos participantes aprovados.',
      programPeriod: 'Maio a junho de 2026',
      deliveryMode: 'Presencial',
      workload: '40 horas',
      scopeSteps:
        '1. Alinhamento do conteúdo programático com o SENAI.\n2. Preparação do material e do ambiente de prática.\n3. Condução das aulas teóricas e práticas.\n4. Avaliação dos participantes.\n5. Emissão de certificados e relatório final.',
      finalDeliverables:
        'Plano de aula, material didático, lista de presença, resultados da avaliação e certificados dos participantes aprovados.',
      deliveryLocation:
        'Aulas no laboratório de eletricidade do SENAI, com práticas supervisionadas em bancadas didáticas.',
      monitoringArea: 'Coordenação de Educação Profissional',
      monitoringResponsible: 'Maykon Alves',
      monitoringEmail: 'maykon.alves@senai.org.br',
      hiringRequirements:
        'Comprovação de habilitação técnica em eletricidade, certificação de instrutor da NR-10 vigente e experiência prévia em turmas equivalentes.',
      paymentMilestones:
        'Pagamento em parcela única após a conclusão da turma, a validação da frequência e a entrega dos certificados.',
    }),
  },

  // SESI · Serviço — manutenção preventiva de elevadores
  'TR-2026-013': {
    model: 'Serviço',
    sections: institutionalSections({
      object:
        'Contratação de empresa especializada para manutenção preventiva mensal dos elevadores das unidades do SESI, incluindo inspeção, lubrificação, ajustes e emissão de laudos técnicos.',
      justification:
        'A manutenção preventiva é necessária para assegurar a disponibilidade e a segurança dos elevadores, atender às normas técnicas e evitar paradas não programadas que afetam o atendimento.',
      serviceSummary:
        'Execução de rotina mensal de manutenção preventiva, atendimento a chamados corretivos prioritários e registro técnico das intervenções em todas as cabines.',
      programPeriod: 'Junho de 2026 a maio de 2027',
      deliveryMode: 'Presencial',
      workload: 'Visitas mensais programadas + atendimento sob demanda',
      scopeSteps:
        '1. Vistoria inicial das cabines e casas de máquinas.\n2. Elaboração do plano de manutenção preventiva mensal.\n3. Execução das rotinas e ajustes.\n4. Atendimento a chamados corretivos prioritários.\n5. Emissão de laudos e relatórios mensais.',
      finalDeliverables:
        'Cronograma de manutenção, relatórios mensais de inspeção, laudos técnicos e registro das correções realizadas.',
      deliveryLocation:
        'Unidades do SESI com elevadores em operação, conforme relação anexa, em horário que minimize o impacto ao público.',
      monitoringArea: 'Gerência de Infraestrutura e Manutenção',
      monitoringResponsible: 'Ana Costa',
      monitoringEmail: 'ana.costa@sesi.org.br',
      hiringRequirements:
        'Registro da empresa no conselho competente, responsável técnico habilitado, comprovação de serviços similares e equipe certificada para manutenção de elevadores.',
      paymentMilestones:
        'Pagamento mensal após a execução das rotinas previstas e a apresentação dos relatórios e laudos do período.',
    }),
  },

  // IEL · Aquisição — kits didáticos (matriz de lotes)
  'TR-2026-012': {
    model: 'Aquisição (matriz de lotes)',
    sections: acquisitionSections({
      object:
        'Aquisição de kits didáticos e componentes para o laboratório móvel de prototipagem, incluindo fornecimento, transporte e entrega nas unidades indicadas.',
      objective:
        'Equipar o laboratório móvel com kits práticos que viabilizem oficinas de prototipagem e robótica, ampliando o alcance das ações educacionais do IEL.',
      hiringJustification:
        'A aquisição supre a ausência de material adequado para as oficinas itinerantes, padroniza os recursos didáticos e garante a reposição de componentes de consumo.',
      lotGroupingJustification:
        'Os itens foram agrupados em lote único por compartilharem finalidade didática, fornecimento e logística de entrega, favorecendo a gestão do contrato.',
      technicalSpecifications:
        'Os kits devem atender a requisitos de segurança, compatibilidade entre componentes, manuais em português e garantia mínima dos itens eletrônicos.',
      warrantyConditions:
        'Garantia mínima de 12 meses para os componentes eletrônicos e reposição de itens com defeito de fabricação sem custo adicional.',
      deliveryInstallTerm:
        'Entrega em até 30 dias corridos após a autorização de fornecimento, em remessa única conferida no recebimento.',
      installationWindow:
        'Recebimento em horário comercial nas unidades indicadas, com conferência de itens e quantidades no ato da entrega.',
      operationalNotes:
        'O fornecedor deve embalar os kits de forma identificada por item e apresentar nota de remessa detalhada para conferência.',
      lots: [
        {
          number: '01',
          name: 'Kits didáticos para laboratório móvel',
          items: [
            {
              location: 'IEL Recife — Av. Cruz Cabugá, 767',
              itemCode: '1',
              summary:
                'Kit de prototipagem eletrônica com placa controladora, sensores e componentes',
              unitMeasure: 'kit',
              quantity: '15',
              delivery: 'Entrega única em até 30 dias',
            },
            {
              location: 'IEL Recife — Av. Cruz Cabugá, 767',
              itemCode: '2',
              summary:
                'Kit de robótica educacional com motores, estrutura e cabos',
              unitMeasure: 'kit',
              quantity: '10',
              delivery: 'Entrega única em até 30 dias',
            },
            {
              location: 'IEL Recife — Av. Cruz Cabugá, 767',
              itemCode: '3',
              summary:
                'Conjunto de componentes de reposição (resistores, jumpers e baterias)',
              unitMeasure: 'conjunto',
              quantity: '20',
              delivery: 'Entrega única em até 30 dias',
            },
          ],
        },
      ],
      deliveries: [
        {
          institutionUnit: 'IEL Pernambuco',
          cnpj: '10.711.962/0001-00',
          address: 'Av. Cruz Cabugá, 767, Santo Amaro, Recife/PE',
        },
      ],
      sampleRequirement:
        'Poderá ser exigida amostra ou ficha técnica dos kits para validação de compatibilidade antes do empenho.',
      contractTerm:
        'Vigência suficiente para fornecimento, entrega, conferência e cobertura da garantia.',
      budgetResources:
        'Recursos previstos no orçamento do IEL, vinculados à rubrica de material didático e equipamentos.',
      proposalRequirements:
        'Proposta com preço por item e global, especificação técnica, prazo de entrega e garantia.',
      qualificationRequirements:
        'Comprovação de fornecimentos similares, regularidade fiscal e capacidade de entrega no prazo.',
      paymentConditions:
        'Pagamento após a entrega integral, a conferência e o aceite, mediante nota fiscal aderente ao objeto.',
      contractingPartyObligations:
        'Disponibilizar o local de recebimento, conferir os itens e registrar o aceite.',
      contractorObligations:
        'Fornecer, transportar e entregar os kits conforme a especificação, o prazo e a garantia.',
      contractGovernance:
        'Fiscalização pela unidade demandante, com registro de recebimento, pendências e aceite final.',
      penalties:
        'Atrasos e divergências sujeitam o fornecedor a advertência, multa e demais penalidades previstas.',
    }),
  },

  // FIEPE · Consultoria — inovação industrial
  'TR-2026-011': {
    model: 'Consultoria',
    sections: institutionalSections({
      object:
        'Contratação de consultoria especializada para estruturar a agenda de inovação industrial, com diagnóstico de maturidade, priorização de iniciativas e plano de implementação para as indústrias associadas.',
      justification:
        'A FIEPE busca acelerar a adoção de práticas de inovação na indústria, identificar oportunidades de maior impacto e orientar investimentos com base em diagnóstico estruturado.',
      serviceSummary:
        'Consultoria para diagnóstico de inovação, entrevistas com lideranças, oficina de priorização e consolidação de um roadmap de iniciativas.',
      programPeriod: 'Setembro a dezembro de 2026',
      deliveryMode: 'Híbrida',
      workload: '60 horas',
      scopeSteps:
        '1. Kick-off e alinhamento de objetivos.\n2. Diagnóstico de maturidade em inovação.\n3. Entrevistas com lideranças industriais.\n4. Oficina de priorização de iniciativas.\n5. Consolidação do roadmap e apresentação executiva.',
      finalDeliverables:
        'Relatório de diagnóstico, roadmap de inovação priorizado, recomendações de investimento e apresentação executiva final.',
      deliveryLocation:
        'Encontros presenciais na sede da FIEPE e sessões remotas com as equipes envolvidas.',
      monitoringArea: 'Gerência de Competitividade e Inovação',
      monitoringResponsible: 'Carlos Henrique',
      monitoringEmail: 'carlos.henrique@fiepe.org.br',
      hiringRequirements:
        'Experiência comprovada em projetos de inovação industrial, equipe sênior e portfólio de casos similares.',
      paymentMilestones:
        'Pagamento por marcos validados, condicionado à entrega dos produtos e ao aceite formal.',
    }),
  },

  // CIEPE · Locação — equipamentos multimídia para evento
  'TR-2026-010': {
    model: 'Locação',
    sections: institutionalSections({
      object:
        'Locação de equipamentos multimídia e estrutura audiovisual para evento corporativo institucional, incluindo montagem, operação técnica e desmontagem.',
      justification:
        'O evento institucional demanda infraestrutura audiovisual de qualidade para garantir a boa experiência do público externo e a transmissão adequada do conteúdo.',
      serviceSummary:
        'Locação de projeção, sonorização, iluminação e painéis, com equipe técnica para operação durante toda a programação do evento.',
      programPeriod: 'Agosto de 2026 (período do evento)',
      deliveryMode: 'Presencial',
      workload: 'Montagem, operação durante o evento e desmontagem',
      scopeSteps:
        '1. Levantamento técnico do local.\n2. Definição do rider de equipamentos.\n3. Montagem e testes.\n4. Operação técnica durante o evento.\n5. Desmontagem e devolução.',
      finalDeliverables:
        'Estrutura audiovisual montada e operante, suporte técnico durante o evento e registro de conformidade da entrega.',
      deliveryLocation:
        'Centro de eventos indicado pela CIEPE, conforme o cronograma do evento corporativo.',
      monitoringArea: 'Coordenação de Eventos Institucionais',
      monitoringResponsible: 'Renata Vieira',
      monitoringEmail: 'renata.vieira@ciepe.org.br',
      hiringRequirements:
        'Comprovação de locações similares, equipamentos em bom estado e equipe técnica qualificada disponível nas datas do evento.',
      paymentMilestones:
        'Pagamento após a realização do evento e a confirmação da entrega dos serviços de locação e operação.',
    }),
  },

  // SENAI · Serviço — revisão de conteúdo pedagógico
  'TR-2026-009': {
    model: 'Serviço',
    sections: institutionalSections({
      object:
        'Contratação de serviço de revisão técnica e editorial de materiais pedagógicos de capacitação profissional, para a nova trilha de cursos do SENAI.',
      justification:
        'A nova trilha de cursos exige revisão de conteúdo para assegurar correção técnica, padronização editorial e aderência às diretrizes pedagógicas antes da publicação.',
      serviceSummary:
        'Revisão técnica e de linguagem dos materiais, padronização de formato, verificação de referências e devolutiva consolidada por unidade curricular.',
      programPeriod: 'Maio a julho de 2026',
      deliveryMode: 'Remota',
      workload: 'Conforme o volume de materiais (estimativa de 200 páginas)',
      scopeSteps:
        '1. Recebimento e triagem dos materiais.\n2. Revisão técnica de conteúdo.\n3. Revisão editorial e padronização.\n4. Consolidação das devolutivas.\n5. Entrega das versões revisadas.',
      finalDeliverables:
        'Materiais revisados, relatório de alterações, glossário padronizado e checklist de conformidade por unidade curricular.',
      deliveryLocation:
        'Trabalho remoto com entregas digitais em formato editável e PDF para a equipe pedagógica do SENAI.',
      monitoringArea: 'Núcleo de Educação a Distância',
      monitoringResponsible: 'Pedro Lima',
      monitoringEmail: 'pedro.lima@senai.org.br',
      hiringRequirements:
        'Experiência comprovada em revisão de materiais educacionais, domínio de normas de redação e disponibilidade no prazo previsto.',
      paymentMilestones:
        'Pagamento por lotes de material revisado e aceito, conforme o cronograma de entregas.',
    }),
  },
}

// Fallback defensivo para ids fora do registro (mantém o documento coerente).
function fallbackSpec(title: string, owner: string): DocumentSpec {
  return {
    model: 'Contratação de Serviço',
    sections: institutionalSections({
      object: `Contratação referente a "${title}", com escopo definido, prazo estimado e critérios mínimos de entrega.`,
      justification:
        'A demanda atende a uma necessidade operacional da unidade e busca reduzir retrabalho, assegurar conformidade e elevar a previsibilidade do processo de contratação.',
      serviceSummary:
        'Execução do serviço conforme escopo acordado, com acompanhamento de marcos e validação das entregas.',
      programPeriod: 'A definir conforme cronograma',
      deliveryMode: 'A definir',
      workload: 'A definir conforme volume',
      scopeSteps:
        '1. Alinhamento inicial.\n2. Execução das frentes previstas.\n3. Consolidação das entregas.\n4. Validação e aceite.',
      finalDeliverables:
        'Produtos finais, relatórios e evidências previstos no escopo da contratação.',
      deliveryLocation:
        'Unidades e formato de atendimento definidos no planejamento da contratação.',
      monitoringArea: 'Área demandante',
      monitoringResponsible: owner,
      monitoringEmail: 'contato@sistemafiepe.org.br',
      hiringRequirements:
        'Experiência comprovada, requisitos técnicos pertinentes e documentação regular.',
      paymentMilestones:
        'Pagamento por marcos de aceite, conforme a entrega dos produtos previstos.',
    }),
  }
}

const baseComments = [
  {
    author: 'Ana Costa',
    date: '07/04/2026',
    message:
      'Ajustar o critério de aceite para deixar mais explícito o marco de validação da entrega.',
  },
  {
    author: 'Carlos Henrique',
    date: '06/04/2026',
    message:
      'A justificativa está boa, mas vale reforçar o impacto na continuidade da operação.',
  },
]

export function getTRDocument(trId?: string) {
  const tr = getTRById(trId)
  const spec = documentSpecs[tr.id] ?? fallbackSpec(tr.title, tr.owner)

  const contextSection: DocumentSection = {
    kind: 'keyValue',
    title: 'Contexto do documento',
    items: [
      { label: 'Instituição', value: tr.unit },
      { label: 'Modelo', value: spec.model },
      { label: 'Unidade responsável', value: tr.unit },
    ],
  }

  return {
    ...tr,
    model: spec.model,
    responsibleUnit: tr.unit,
    sections: [contextSection, ...spec.sections],
    comments: baseComments,
  }
}
