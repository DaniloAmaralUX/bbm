# PRD — Fase Preparatória (DFD · ETP · TR)

> Nome do produto: **placeholder** ("Fase Preparatória"). Documento de requisitos para implementação. Companheiros: `PRODUCT.md` (produto e personas), `DESIGN.md` (sistema de design), `PLANO-REAPROVEITAMENTO.md` (análise de reuso e decisões), `CLAUDE.md` (manual operacional). Protótipo de validação em `prototypes/fase1-cadeia-heranca.html`.

## 1. Visão e problema

A fase preparatória da contratação pública (Lei 14.133) produz três documentos encadeados — **DFD → ETP → TR** — hoje preenchidos de forma manual, desconectada e com retrabalho. Cada documento repete informações do anterior, sem rastreio, e sem padronização de modelo.

O produto resolve isso com: (a) um **construtor de modelos** (a área de Sustentação define a estrutura de cada documento), (b) a **geração de documentos** a partir dos modelos publicados, (c) **herança controlada** das informações comuns ao longo da cadeia, e (d) **apoio de IA** no levantamento de mercado e na sugestão de itens.

## 2. Objetivos e não-objetivos

**Objetivos (v0)**
- Gerar DFD, ETP e TR a partir de modelos, com um único motor.
- Construtor de modelos editável e publicável (perfil Sustentação).
- Herança controlada e **visível** dos campos comuns ao longo da cadeia.
- Apoio de IA (mockado) com a interface pronta para integração futura.
- Base acessível (WCAG AA) e responsiva, pronta para hardware modesto de órgão público.

**Não-objetivos (v0)**
- Autenticação/login real (papéis são contexto de UI).
- Backend/persistência real (frontend-first, dados mockados).
- Integração real com PNCP/repositório (IA mockada nesta rodada).
- Assinatura digital, workflow de aprovação multi-instância, e fases pós-TR (edital, contrato).

## 3. Usuários e papéis

Detalhe em `PRODUCT.md`. Resumo:
- **Sustentação** — cria, edita e publica os modelos (DFD/ETP/TR).
- **Requisitante (Ana)** — gera os documentos a partir dos modelos, com herança e IA.
- **Sam** — usuário dependente de acessibilidade (requisito transversal, não um papel de negócio).

No v0, o papel é um **seletor de contexto de UI** que alterna menu e permissões; sem login.

## 4. Conceitos de domínio

- **DocType**: `dfd | etp | tr`. Dimensão de primeira classe que parametriza modelo, formulário, view e export.
- **Modelo (template)**: estrutura de um DocType — seções, campos, tipos, obrigatoriedade, regras, estado (rascunho/publicado), versão.
- **Documento**: instância gerada de um modelo, com valores, status e vínculo de cadeia (`parentId`).
- **Cadeia**: dependência DFD → ETP → TR. Não criar ETP sem DFD concluído; nem TR sem ETP.
- **Herança**: campos comuns (objeto, justificativa, unidade requisitante, responsável, vínculo ao PCA; e a solução do ETP para o TR) fluem para o documento seguinte. Cada campo herdado é `herdado`, e vira `ajustado` se editado, com possibilidade de restaurar o valor herdado. A herança é sempre **visível e rastreável**.

## 5. Requisitos funcionais

### 5.1 Construtor de modelos (perfil Sustentação)
- RF-01: Listar modelos por DocType e estado (rascunho/publicado).
- RF-02: Criar/editar um modelo definindo seções e campos (label, tipo: texto/textarea/select/data/email, obrigatoriedade, placeholder, ajuda, opções).
- RF-03: Marcar campos como **comuns/herdáveis** (participam da herança da cadeia).
- RF-04: Pré-visualizar o modelo como o documento final apareceria.
- RF-05: Publicar/despublicar e versionar; publicar não pode quebrar documentos existentes sem aviso.

### 5.2 Geração de documento (perfil Requisitante) — wizard
- RF-06: Iniciar um documento escolhendo DocType e modelo publicado.
- RF-07: Renderizar o formulário dinamicamente a partir do modelo, em seções com divulgação progressiva (≤4 campos por bloco antes de quebra visual).
- RF-08: Pré-preencher campos comuns por **herança** do documento-pai; marcar `herdado`/`ajustado`; permitir restaurar o valor herdado.
- RF-09: Validar obrigatoriedade e formato antes de concluir; preservar o que o usuário digitou em caso de erro.
- RF-10: Salvar rascunho e Concluir; documento concluído fica somente-leitura e libera o próximo da cadeia.
- RF-11: Assistente de IA (mock) por campo conforme o DocType: ETP → levantamento de mercado; TR → sugerir itens/preços/unidades.

### 5.3 Campos por documento (modelos padrão do v0)
- **DFD**: unidade requisitante, responsável, objeto, justificativa, data prevista, vínculo ao PCA.
- **ETP**: [herdados: objeto, justificativa, unidade, responsável, PCA] + problema, requisitos, levantamento de mercado (IA), valor estimado, solução, conclusão.
- **TR**: [herdados: objeto, justificativa, unidade, responsável, PCA, solução] + requisitos, execução, critérios de medição, itens (tabela com IA), modalidade observada.

### 5.4 Visualização e exportação
- RF-12: View consolidada do documento (artefato oficial), com a herança consolidada em texto.
- RF-13: Exportar/imprimir (`@media print`): sem navegação, quebras de página lógicas, cabeçalho/rodapé com identificação e número do documento.

### 5.5 Dashboard e listagem
- RF-14: Dashboard com KPIs da cadeia (DFD/ETP/TR por status, por unidade, taxa de conclusão) usando dado mock realista (não números decorativos).
- RF-15: Listagem com filtro por DocType, status e vínculo de cadeia; tabela responsiva (vira cards no mobile).

## 6. Requisitos não-funcionais

- RNF-01: Acessibilidade WCAG AA — teclado, foco visível, alvos ≥44px, contraste (body ≥4.5:1, grande/UI ≥3:1), status nunca por cor isolada.
- RNF-02: Performance para **hardware modesto e rede lenta** (público de órgão público): orçamento de performance, sem coreografia de page-load, virtualização/paginação em listas grandes.
- RNF-03: Responsivo e estrutural (sidebar colapsa, tabela→cards), contexto primário por superfície (formulários são desktop-first).
- RNF-04: Formatos brasileiros via `Intl` (dd/mm/aaaa, 1.000,00, R$).
- RNF-05: Conformidade com o sistema de design (`DESIGN.md`): tema Nature por tokens, primitivas `Field` do shadcn, glossário canônico, sem em-dash, movimento só de estado.
- RNF-06: Frontend-first com dados mockados; código preparado para plugar backend/API depois.

## 7. Faseamento e critérios de aceite

Cada fase fecha contra a **Definição de Pronto** do `DESIGN.md` e passa por `critique` + `audit` (alvo: faixa Excelente).

- **Fase 0 — Identidade e tema** (feito): tema Nature aplicado, identidade placeholder, docs-fonte criados. Aceite: app sobe com o tema, sem referências de marca TR Fácil/FIEPE na camada de aplicação.
- **Fase 1 — Generalizar o domínio**: introduzir `DocType`; renomear `features/tr` → `features/documents`; tornar os tipos de modelo neutros; função `inheritCommonFields`. Aceite: o app roda gerando DFD/ETP/TR pelo mesmo motor, com herança funcional (espelha o protótipo).
- **Fase 2 — Construtor de modelos**: CRUD de modelos com campos/seções/regras/publicação (perfil Sustentação). Aceite: criar um modelo, publicar e gerar um documento a partir dele.
- **Fase 3 — Três documentos + herança completa**: modelos padrão DFD/ETP/TR, `parentId`, regras de dependência da cadeia, herança visível/ajustável. Aceite: percorrer DFD→ETP→TR com herança e bloqueio de dependência.
- **Fase 4 — Dashboard/listagem/view multi-tipo**: KPIs e filtros por DocType; view e export parametrizados. Aceite: dashboard e listagem refletem os três tipos; export com `@media print`.
- **Fase 5 — IA e papéis**: assistente por DocType (mock→pronto p/ integração); seletor de papel Sustentação/Requisitante. Aceite: IA mockada por campo e troca de papel altera telas/permissões.

## 8. Métricas de sucesso (proxy, v0)

- Um documento da cadeia é gerado de ponta a ponta sem o usuário reescrever informação comum (herança elimina o retrabalho).
- `audit` técnico na faixa Excelente (18–20) por superfície.
- Zero violação de carga cognitiva crítica (≤4 itens por bloco; contexto herdado co-locado).

## 9. Questões em aberto

- Nome e identidade visual definitivos.
- Quando entra backend/persistência e qual stack.
- Modelo de papéis/permissões definitivo (com ou sem login).
- Escopo real da integração de IA (PNCP, repositório próprio) e governança de dados.
