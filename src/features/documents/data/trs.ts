import { type TRItem } from './schema'

/**
 * Documentos mock da fase preparatória, organizados em CADEIAS reais ligadas por
 * `parentId` (ETP aponta para seu DFD; TR para seu ETP). O conjunto cobre, com
 * dados ilustrativos plausíveis de uma prefeitura:
 * - 2 cadeias completas e concluídas (DFD -> ETP -> TR todos aprovados);
 * - 1 cadeia em andamento (DFD/ETP concluídos, TR em rascunho);
 * - 3 cadeias parciais (DFD concluído -> ETP em rascunho);
 * - 4 DFDs sozinhos (alguns concluídos, outros em rascunho);
 * - 2 documentos avulsos (sem vínculo de cadeia registrado).
 * Pais que já têm filho ficam `approved` (concluído libera o próximo da cadeia).
 * As contagens do dashboard (KPIs, status, unidade, tipo, funil de conclusão)
 * são derivadas deste conjunto - ver data/metrics.ts.
 */
export const trs: TRItem[] = [
  // --- Cadeia em andamento: mobiliário das unidades de atendimento ---
  {
    id: 'DFD-2026-031',
    docType: 'dfd',
    title: 'Aquisição de mobiliário para as unidades de atendimento',
    unit: 'Secretaria de Administração',
    owner: 'Ana Ribeiro',
    status: 'approved',
    nature: 'aquisicao',
    updatedAt: '2026-03-10',
    currentStep: 'Concluído',
    summary:
      'Reequipar as unidades de atendimento ao público com mobiliário ergonômico, incluindo entrega e montagem.',
  },
  {
    id: 'ETP-2026-031',
    docType: 'etp',
    parentId: 'DFD-2026-031',
    title: 'Estudo para aquisição de mobiliário das unidades de atendimento',
    unit: 'Secretaria de Administração',
    owner: 'Ana Ribeiro',
    status: 'approved',
    nature: 'aquisicao',
    updatedAt: '2026-03-28',
    currentStep: 'Concluído',
    summary:
      'Análise de viabilidade e alternativas para o reequipamento ergonômico das unidades de atendimento ao público.',
  },
  {
    id: 'TR-2026-031',
    docType: 'tr',
    parentId: 'ETP-2026-031',
    title: 'Termo de referência do mobiliário das unidades de atendimento',
    unit: 'Secretaria de Administração',
    owner: 'Ana Ribeiro',
    status: 'draft',
    nature: 'aquisicao',
    updatedAt: '2026-04-10',
    currentStep: 'Itens e modalidade',
    summary:
      'Especificação do mobiliário ergonômico, com itens, quantidades, entrega e montagem para as unidades de atendimento.',
  },

  // --- Cadeia completa e concluída: reforma e ampliação da UBS Central ---
  {
    id: 'DFD-2026-040',
    docType: 'dfd',
    title: 'Reforma e ampliação da UBS Central',
    unit: 'Secretaria de Saúde',
    owner: 'Patrícia Gomes',
    status: 'approved',
    nature: 'servico',
    updatedAt: '2026-02-12',
    currentStep: 'Concluído',
    summary:
      'Obra de reforma e ampliação da Unidade Básica de Saúde Central para ampliar a capacidade de atendimento.',
  },
  {
    id: 'ETP-2026-040',
    docType: 'etp',
    parentId: 'DFD-2026-040',
    title: 'Estudo para a reforma e ampliação da UBS Central',
    unit: 'Secretaria de Saúde',
    owner: 'Patrícia Gomes',
    status: 'approved',
    nature: 'servico',
    updatedAt: '2026-02-28',
    currentStep: 'Concluído',
    summary:
      'Avaliação técnica e de custos das alternativas de reforma e ampliação da unidade, com cronograma de obra.',
  },
  {
    id: 'TR-2026-040',
    docType: 'tr',
    parentId: 'ETP-2026-040',
    title: 'Termo de referência da reforma da UBS Central',
    unit: 'Secretaria de Saúde',
    owner: 'Patrícia Gomes',
    status: 'approved',
    nature: 'servico',
    updatedAt: '2026-03-20',
    currentStep: 'Concluído',
    summary:
      'Especificação dos serviços de engenharia, com etapas, medição e critérios de aceite para a reforma da UBS.',
  },

  // --- Cadeia completa e concluída: laboratórios de informática das escolas ---
  {
    id: 'DFD-2026-014',
    docType: 'dfd',
    title: 'Aquisição de equipamentos para os laboratórios de informática',
    unit: 'Secretaria de Educação',
    owner: 'Bruno Carvalho',
    status: 'approved',
    nature: 'aquisicao',
    updatedAt: '2026-02-05',
    currentStep: 'Concluído',
    summary:
      'Renovação do parque de computadores dos laboratórios de informática da rede municipal de ensino.',
  },
  {
    id: 'ETP-2026-014',
    docType: 'etp',
    parentId: 'DFD-2026-014',
    title: 'Estudo para os laboratórios de informática das escolas',
    unit: 'Secretaria de Educação',
    owner: 'Bruno Carvalho',
    status: 'approved',
    nature: 'aquisicao',
    updatedAt: '2026-02-22',
    currentStep: 'Concluído',
    summary:
      'Dimensionamento de quantitativos e estimativa de preços para a renovação dos laboratórios escolares.',
  },
  {
    id: 'TR-2026-014',
    docType: 'tr',
    parentId: 'ETP-2026-014',
    title: 'Termo de referência dos laboratórios de informática',
    unit: 'Secretaria de Educação',
    owner: 'Bruno Carvalho',
    status: 'approved',
    nature: 'aquisicao',
    updatedAt: '2026-03-15',
    currentStep: 'Concluído',
    summary:
      'Especificação dos equipamentos, garantia e instalação para a renovação dos laboratórios de informática.',
  },

  // --- Cadeia parcial: medicamentos da rede básica de saúde ---
  {
    id: 'DFD-2026-029',
    docType: 'dfd',
    title: 'Aquisição de medicamentos para a rede básica de saúde',
    unit: 'Secretaria de Saúde',
    owner: 'Carlos Henrique',
    status: 'approved',
    nature: 'aquisicao',
    updatedAt: '2026-03-05',
    currentStep: 'Concluído',
    summary:
      'Reposição do estoque de medicamentos essenciais das unidades básicas de saúde para o exercício.',
  },
  {
    id: 'ETP-2026-029',
    docType: 'etp',
    parentId: 'DFD-2026-029',
    title: 'Estudo para aquisição de medicamentos da rede básica',
    unit: 'Secretaria de Saúde',
    owner: 'Carlos Henrique',
    status: 'draft',
    nature: 'aquisicao',
    updatedAt: '2026-04-09',
    currentStep: 'Mercado e solução',
    summary:
      'Avaliação de quantitativos, alternativas de fornecimento e estimativa de preços para a reposição de medicamentos essenciais.',
  },

  // --- Cadeia parcial: modernização da iluminação pública ---
  {
    id: 'DFD-2026-018',
    docType: 'dfd',
    title: 'Modernização da rede de iluminação pública',
    unit: 'Secretaria de Infraestrutura',
    owner: 'Marcos Tavares',
    status: 'approved',
    nature: 'servico',
    updatedAt: '2026-03-02',
    currentStep: 'Concluído',
    summary:
      'Substituição das luminárias por tecnologia LED com gestão remota para reduzir consumo e custo de manutenção.',
  },
  {
    id: 'ETP-2026-018',
    docType: 'etp',
    parentId: 'DFD-2026-018',
    title: 'Estudo de modernização da iluminação pública',
    unit: 'Secretaria de Infraestrutura',
    owner: 'Marcos Tavares',
    status: 'draft',
    nature: 'servico',
    updatedAt: '2026-04-06',
    currentStep: 'Análise do problema',
    summary:
      'Estudo de viabilidade para substituição das luminárias por tecnologia LED com gestão remota.',
  },

  // --- Cadeia parcial: vigilância patrimonial ---
  {
    id: 'DFD-2026-033',
    docType: 'dfd',
    title: 'Contratação de vigilância patrimonial dos próprios municipais',
    unit: 'Secretaria de Administração',
    owner: 'Diego Martins',
    status: 'approved',
    nature: 'servico',
    updatedAt: '2026-03-12',
    currentStep: 'Concluído',
    summary:
      'Serviço continuado de vigilância patrimonial armada e desarmada para os edifícios da administração.',
  },
  {
    id: 'ETP-2026-033',
    docType: 'etp',
    parentId: 'DFD-2026-033',
    title: 'Estudo para a vigilância patrimonial dos próprios municipais',
    unit: 'Secretaria de Administração',
    owner: 'Diego Martins',
    status: 'draft',
    nature: 'servico',
    updatedAt: '2026-04-04',
    currentStep: 'Análise do problema',
    summary:
      'Dimensionamento de postos por turno e análise de alternativas para a vigilância dos próprios municipais.',
  },

  // --- DFDs sozinhos (raiz de cadeia, sem filho ainda) ---
  {
    id: 'DFD-2026-027',
    docType: 'dfd',
    title: 'Capacitação de servidores em gestão de contratos',
    unit: 'Procuradoria-Geral',
    owner: 'Fernanda Lopes',
    status: 'approved',
    nature: 'capacitacao',
    updatedAt: '2026-03-30',
    currentStep: 'Concluído',
    summary:
      'Formação de equipes em fiscalização e gestão contratual conforme a Lei 14.133.',
  },
  {
    id: 'DFD-2026-036',
    docType: 'dfd',
    title: 'Aquisição de ambulâncias para o SAMU',
    unit: 'Secretaria de Saúde',
    owner: 'Carlos Henrique',
    status: 'draft',
    nature: 'aquisicao',
    updatedAt: '2026-04-07',
    currentStep: 'Objeto e justificativa',
    summary:
      'Renovação da frota de ambulâncias do serviço de atendimento móvel de urgência.',
  },
  {
    id: 'DFD-2026-024',
    docType: 'dfd',
    title: 'Locação de impressoras para a administração',
    unit: 'Secretaria de Administração',
    owner: 'Diego Martins',
    status: 'draft',
    nature: 'locacao',
    updatedAt: '2026-04-03',
    currentStep: 'Identificação',
    summary:
      'Outsourcing de impressão com franquia mensal e manutenção para as áreas administrativas.',
  },
  {
    id: 'DFD-2026-022',
    docType: 'dfd',
    title: 'Consultoria para o plano municipal de mobilidade urbana',
    unit: 'Secretaria de Infraestrutura',
    owner: 'Marcos Tavares',
    status: 'draft',
    nature: 'consultoria',
    updatedAt: '2026-04-01',
    currentStep: 'Identificação',
    summary:
      'Elaboração do plano de mobilidade com diagnóstico, diretrizes e plano de ação para o município.',
  },

  // --- Documentos avulsos (sem vínculo de cadeia registrado) ---
  {
    id: 'TR-2026-012',
    docType: 'tr',
    title: 'Serviço de limpeza das escolas municipais',
    unit: 'Secretaria de Educação',
    owner: 'Juliana Ferraz',
    status: 'approved',
    nature: 'servico',
    updatedAt: '2026-04-08',
    currentStep: 'Concluído',
    summary:
      'Contratação de limpeza e conservação continuada para a rede de escolas, com postos por turno.',
  },
  {
    id: 'ETP-2026-016',
    docType: 'etp',
    title: 'Locação de veículos para a frota administrativa',
    unit: 'Secretaria de Administração',
    owner: 'Renata Vieira',
    status: 'draft',
    nature: 'locacao',
    updatedAt: '2026-04-02',
    currentStep: 'Análise do problema',
    summary:
      'Análise de alternativas entre locação e frota própria para o transporte administrativo.',
  },
]
