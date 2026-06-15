import { type TRItem } from './schema'

/**
 * Documentos mock da fase preparatória, organizados em CADEIAS reais ligadas por
 * `parentId` (ETP aponta para seu DFD; TR para seu ETP). O conjunto cobre:
 * - 1 cadeia completa (mobiliário: DFD -> ETP -> TR);
 * - 2 cadeias parciais (medicamentos e iluminação: DFD -> ETP);
 * - 2 DFDs sozinhos (1 concluído sem filho, 1 ainda em rascunho);
 * - 2 documentos avulsos (sem vínculo de cadeia registrado), para volume.
 * Pais que já têm filho ficam `approved` (concluídos liberam o próximo da cadeia).
 */
export const trs: TRItem[] = [
  // --- Cadeia completa: mobiliário das unidades de atendimento ---
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
