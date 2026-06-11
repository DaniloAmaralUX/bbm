# Plano de reaproveitamento — da base TR Fácil para a plataforma DFD → ETP → TR

Plano de migração para reutilizar a interface e as funcionalidades do **TR Fácil** como base de um novo produto: uma plataforma da **fase preparatória da contratação**, que cobre a cadeia documental **DFD → ETP → TR**, com construtor de modelos, herança controlada de informações e apoio de IA.

---

## 1. O que o novo produto pede (resumo do briefing)

A documentação enviada (resumo executivo + fluxo de usuário) descreve:

- **Dois papéis distintos:**
  - **Sustentação** — cria e publica os *modelos* (templates) de DFD, ETP e TR.
  - **Usuária operacional (Ana)** — usa os modelos já aprovados para gerar os *documentos*.
- **Construtor de modelos** ("modelo define a estrutura do formulário, campos obrigatórios e regras"). Hoje o TR Fácil tem isso, mas *hardcoded*; o novo produto exige modelos como dado editável/publicável.
- **Três tipos de documento em sequência, com dependência:**
  - **DFD** — documento inaugural, formaliza a necessidade (objeto, justificativa, unidade, responsável, data prevista, vínculo ao PCA).
  - **ETP** — análise de viabilidade (problema, requisitos, quantidades, levantamento de mercado com IA/PNCP, valor estimado, solução, conclusão).
  - **TR** — especificação da solução (objeto herdado, requisitos, execução, medição, itens com IA, preço, modalidade).
- **Herança controlada** de informações comuns ao longo da cadeia (objeto, justificativa, unidade, responsável, PCA fluem DFD → ETP → TR).
- **Apoio de IA** — levantamento de mercado (PNCP + repositório próprio) e sugestão de itens/preços/unidades/modalidade.

---

## 2. Diagnóstico da base atual

A base do TR Fácil está bem separada em três camadas, o que favorece o reaproveitamento:

- `src/app/` — bootstrap, router (TanStack), providers, contexts de tema/layout, query-client. **Agnóstico ao domínio.**
- `src/shared/` — casca reutilizável: layout (sidebar, header, command-palette), ~45 componentes shadcn/ui, `data-table` genérica (toolbar, filtros, paginação, ações em massa), hooks e utils. **Agnóstico ao domínio.**
- `src/features/tr/` — o domínio: dashboard, listagem, wizard (com stepper, assistente de IA e store Zustand) e view do documento. **Específico do TR.**

Um ponto-chave: o arquivo `features/tr/data/templates.ts` **já contém um motor de definição de modelo** (`TRTemplateDefinition` com `fields`, `sections`, `kind`, regras de obrigatoriedade e `buildReviewState`). Ou seja, o conceito de "modelo dirige o formulário" já existe — falta torná-lo **dado editável** em vez de constante de código. Esse é o maior ativo reaproveitável para o construtor de modelos.

### Classificação dos arquivos

| Camada | Reuso |
|---|---|
| `app/` (router, providers, contexts, query-client) | **Reusar quase intacto** |
| `shared/ui/*` (45 componentes) | **Reusar 100%** |
| `shared/data-table/*`, `shared/hooks/*`, `shared/lib/*` | **Reusar 100%** |
| `shared/layout/*` | **Reusar com ajuste** (menu, títulos, breadcrumb, user-menu) |
| `app/styles/theme.css`, `index.html`, favicon, logo | **Ajustar identidade** (cores, nome, fonte) |
| `features/tr/wizard/*` | **Generalizar** → motor de wizard dirigido por modelo |
| `features/tr/data/templates.ts` | **Evoluir** → modelos como dado + construtor |
| `features/tr/data/tr-assistant.ts` | **Generalizar** → assistente por tipo de doc |
| `features/tr/dashboard`, `list`, `view` | **Reusar padrão**, re-tematizar para os 3 tipos |
| `features/tr/data/app.ts`, `sidebar-data.ts`, `schema.ts` | **Substituir** (identidade e modelo de dados novos) |

### Pontos de acoplamento ao TR fora de `features/tr/`

Estes arquivos referenciam o TR/FIEPE e precisam de ajuste de identidade:
`shared/assets/fiepe-logo.ts`, `shared/layout/app-title.tsx`, `shared/layout/command-palette.tsx`, `shared/layout/data/sidebar-data.ts`, `shared/layout/route-breadcrumb.tsx`, `shared/layout/user-menu.tsx`, as rotas em `routes/_authenticated/*`, e `index.html`.

---

## 3. Estratégia de reaproveitamento

A recomendação é **evoluir a base** (não reescrever): manter `app/` e `shared/` praticamente intactos e transformar `features/tr/` num domínio genérico de "documentos da fase preparatória".

### 3.1. Generalizar o motor de modelos (o coração da mudança)

Hoje o "modelo" é uma constante (`templates.ts`). O novo produto precisa de:

- Um **tipo de documento** (`DocType = 'dfd' | 'etp' | 'tr'`) como dimensão de primeira classe.
- **Modelos como dado** (`ModelDefinition`): campos, seções, regras de obrigatoriedade, status (rascunho/publicado), versão. Reaproveita as estruturas `TRFieldDefinition`/`TRSectionDefinition`/`TRTemplateDefinition` já existentes, renomeadas para algo neutro (`FieldDefinition`, `SectionDefinition`, `ModelDefinition`).
- Um **construtor de modelos** (nova feature `features/models/`): tela onde a Sustentação cria/edita/publica os modelos — reutiliza os mesmos primitives de formulário do wizard.

### 3.2. Generalizar o wizard para gerar qualquer documento

O wizard atual (`features/tr/wizard`) já é dirigido por um template definition + store Zustand + assistente de IA. Generalizar para:

- Receber `docType` + `modelDefinition` e renderizar o formulário dinamicamente (já faz isso para o TR).
- Suportar **herança**: ao criar um ETP a partir de um DFD, pré-preencher os campos comuns; idem TR a partir do ETP. Implementar como uma função `inheritCommonFields(source, targetModel)` no store.
- Mover o store para `features/documents/wizard/store` e parametrizar por tipo.

### 3.3. Modelar a cadeia documental e a herança

- Entidade `Document` com `{ id, docType, modelId, parentId, status, data, ... }`.
- `parentId` liga ETP→DFD e TR→ETP, habilitando herança e a "jornada" do prototipo.
- Regras de dependência (não criar ETP sem DFD concluído; TR sem ETP) — validação no fluxo.

### 3.4. Papéis (Sustentação vs. operacional)

O prototipo distingue quem cria modelos de quem cria documentos. Decisão pendente (ver §5) sobre autenticação. Mínimo viável sem auth: um seletor/contexto de "perfil" que muda o menu e as permissões de tela (Sustentação vê o construtor de modelos; operacional vê geração de documentos).

### 3.5. Dashboard, listagem e view

- **Dashboard**: reusar `tr-kpi-cards` e os charts, re-tematizando KPIs para a cadeia (ex.: DFDs/ETPs/TRs por status, documentos por unidade, taxa de conclusão).
- **Listagem**: reusar a `data-table` genérica; adicionar coluna/filtro por `docType` e por vínculo de cadeia.
- **View do documento**: reusar `tr-document-view` + `document-export`; parametrizar por tipo de documento.

### 3.6. Apoio de IA

Generalizar `tr-assistant.ts` (hoje suggest/expand/rewrite mockados) para:

- Ações por tipo de documento (ex.: ETP → "levantamento de mercado"; TR → "sugerir itens e preços").
- Manter mock no v0; deixar a interface pronta para integração real (PNCP/repositório) depois.

---

## 4. Faseamento sugerido

**Fase 0 — Fork + identidade (rápido).** Duplicar a base, trocar nome/cores/logo/favicon/metadados, limpar referências FIEPE/TR fora de `features/`, atualizar README.

**Fase 1 — Generalizar o domínio.** Renomear `features/tr` → `features/documents`; introduzir `DocType`; tornar os tipos de modelo neutros. App roda igual ao TR atual, mas estruturado para 3 tipos.

**Fase 2 — Construtor de modelos.** Nova feature `features/models/` com CRUD de modelos (campos/seções/regras/publicação), persistindo os modelos como dado. Telas para o perfil Sustentação.

**Fase 3 — Três tipos de documento + herança.** Instanciar modelos DFD, ETP e TR; wizard de geração por tipo; `parentId` + herança de campos comuns; regras de dependência da cadeia.

**Fase 4 — Dashboard, listagem e view multi-tipo.** Re-tematizar KPIs/charts; filtros por tipo e cadeia; view/export parametrizados.

**Fase 5 — IA e papéis.** Assistente por tipo de documento (mock → integração); modelo de papéis/permissões (com ou sem auth, conforme decisão).

---

## 5. Decisões tomadas

Definições já confirmadas para o v0:

1. **Repositório**: **fork novo** — duplicar a base num projeto separado, preservando o TR Fácil intacto.
2. **Escopo do v0**: **construtor de modelos completo** — modelos editáveis/publicáveis já entram na primeira versão.
3. **Persistência e auth**: **frontend-first com dados mockados e sem autenticação**, usando um seletor de perfil simples (Sustentação vs. operacional) para alternar telas/permissões.
4. **IA**: mantida **mockada** no v0, com a interface pronta para integração futura (PNCP/repositório).

Ainda a definir (não bloqueia o início): **nome e identidade visual** do novo produto (hoje tudo é "TR Fácil / Sistema FIEPE"). Posso usar um placeholder neutro até você decidir.

### Impacto das decisões no faseamento

- Como o **construtor completo** entra no v0, a **Fase 2** sobe de prioridade e caminha junto com a Fase 1.
- Como persistência segue **mockada**, os modelos e documentos vivem em memória/store (Zustand) e seeds — sem backend nesta rodada.
- Como **sem auth**, o perfil é um contexto de UI (não há login), o que simplifica a Fase 5.

---

## 6. Avaliação pela ótica de design de front-end

Esta seção avalia o plano pela lente da skill `frontend-design`, que cobra uma identidade visual deliberada e específica do produto — não defaults templatizados.

### 6.1. O risco que o plano subestima

O plano resolve muito bem o reuso de **engenharia** (`app/`, `shared/`, motor de templates), mas trata a identidade como acabamento ("ajustar cores e logo"). Pela ótica de design, isso é o maior risco: reaproveitar a casca do TR Fácil como está — shadcn/ui no padrão de fábrica + azul institucional genérico — faz o novo produto **nascer parecendo um template e um derivado do TR Fácil**, sem ponto de vista próprio. Reuso de componentes ≠ reuso de aparência. A direção visual precisa ser uma *decisão*, tomada cedo (na Fase 0), não uma sobra do fim.

Observação sobre os protótipos enviados: eles já apontam um gosto (petróleo/teal `#0f5f66`/`#1e6f74`, fundos creme, títulos em serifa Georgia). Isso é uma pista útil, mas o combo *creme + serifa* é um dos visuais que hoje "soam a IA genérica" — vale partir da intenção por trás dele (sobriedade institucional + calor), sem copiar o clichê.

### 6.2. Ancorar no assunto

Antes de estilizar, fixar o assunto: é uma plataforma da **fase preparatória da contratação pública brasileira** (Lei 14.133). Público: equipe de Sustentação (constrói modelos) e a requisitante operacional (Ana). Trabalho da tela: dar **confiança de que cada documento da cadeia está completo e herdou corretamente do anterior**. O vocabulário do domínio — processo administrativo, protocolo, vínculo ao PCA, esteira documental, artigos numerados — é a fonte das escolhas distintivas.

### 6.3. Direção visual proposta (sistema de tokens)

- **Paleta (revisada após a skill `taste-skill` — ver §8.3):** **um único acento travado** em **petróleo/teal** (`#0F5F66`), saturação abaixo de 80%, usado na página inteira; base de **neutros frios** (off-white `#F7F8F8` e tinta off-black `#16181A`, família zinc/slate), **não** creme quente; status (rascunho/concluído/herdado) via `Badge` variants/tokens semânticos, dessaturados. **Sem segundo acento** (o "âmbar de protocolo" da versão anterior foi removido por cair na família brass/clay que a `taste-skill` bane).
- **Tipografia (revisada de novo após `impeccable` — ver §9.2):** **uma única família sans bem calibrada** carregando títulos, labels, botões, body e dados (UI de produto **não precisa** de par display/body); **escala em rem fixa**, não `clamp()` fluida; razão de escala curta (1.125–1.2). **Não serifa** (AI tell aqui). **Mono utilitária** só para códigos/protocolos (`TR-2026-021`, item do PCA). Inter/grotesca familiar é legítima — é produto, e familiaridade é uma vantagem.
- **Layout:** a cadeia **DFD → ETP → TR** como espinha dorsal persistente. Aqui a numeração 1·2·3 **é legítima** (ao contrário do alerta geral da skill), porque a ordem é uma dependência real do processo, não enfeite.
- **Elemento-assinatura:** a **visualização de herança/linhagem** — tornar visível como um campo (objeto, justificativa, unidade) flui do DFD para o ETP e para o TR, com indicação de "herdado / ajustado". É o conceito central do produto ("herança controlada") transformado em algo tangível, e é o que ninguém vai confundir com outro app. A ousadia se concentra aqui; o resto fica quieto.

### 6.4. Restrição e piso de qualidade

Gastar a ousadia só na assinatura (a linhagem da cadeia) e manter formulários sóbrios e disciplinados — são documentos oficiais longos, onde excesso visual atrapalha. Piso obrigatório: responsivo até mobile, foco de teclado visível, `prefers-reduced-motion` respeitado. Animação só onde serve (a revelação da herança entre etapas), nunca espalhada.

### 6.5. Texto de interface (copy como material de design)

O plano não cobre o texto da interface, e a skill trata isso como design. Diretrizes: vocabulário da requisitante, não do sistema ("vínculo ao PCA", não "FK do plano"); voz ativa e consistente ponta a ponta (botão "Concluir ETP" → toast "ETP concluído"); estados vazios como convite à ação ("Comece pelo DFD"); erros que dizem o que houve e como resolver, na voz do produto.

### 6.6. Ajustes recomendados ao plano

1. **Subir a identidade visual para a Fase 0** como decisão de design (sistema de tokens em `app/styles/theme.css`), não como acabamento posterior.
2. **Tratar a view do documento** (DFD/ETP/TR renderizado) como superfície de design própria — deve parecer um artefato oficial, não um `tr-document-view` reaproveitado sem ajuste.
3. **Adicionar a assinatura de herança** como item explícito de escopo do v0 (Fase 3), não emergente.
4. **Validar o design em dois passos** (brainstorm de tokens → crítica contra o clichê → só então codar), conforme a skill, antes de cravar o tema.

---

## 7. Conformidade com o design system shadcn

Avaliação pela skill `shadcn`. A base já é um projeto shadcn — estilo **new-york**, primitives **Radix**, **Tailwind v4** (variáveis CSS em `src/app/styles/index.css`), ícones **lucide**, MCP do shadcn configurado em `.mcp.json` e 29 componentes em `src/shared/ui`. O fork herda tudo isso. O que falta é **enforçar as regras** do design system na continuidade e fechar lacunas para um produto form-heavy.

### 7.1. Regras a enforçar (sempre)

- **Tokens semânticos, nunca cores cruas.** `bg-primary`, `text-muted-foreground`, `Badge variant` — nunca `bg-blue-500` ou `text-emerald-600` em markup.
- **Variantes e composição antes de estilo custom.** Usar `variant`/`size` dos componentes e compor primitives existentes antes de escrever `div` estilizado.
- **`className` só para layout**, nunca para sobrescrever cor/tipografia dos componentes.
- **Espaçamento com `gap-*`** (`flex flex-col gap-*`), nunca `space-y-*`/`space-x-*`; `size-*` quando largura = altura; `truncate`; `cn()` para classes condicionais; sem `z-index` manual em overlays; sem `dark:` manual (tokens resolvem o dark).
- **Usar componentes, não markup custom:** `Alert` para callouts, `Empty` para estados vazios, `Badge` para status, `Separator` em vez de `<hr>`, `Skeleton` para loading, `sonner` para toast.

### 7.2. Lacuna principal: primitivas de formulário

O produto é intensivo em formulários (DFD, ETP, TR e o construtor de modelos), mas o wizard atual usa `Label` + `Input` soltos em `div`/grid. A skill exige as primitivas novas, que **ainda não estão instaladas**: `Field`/`FieldGroup`/`FieldLabel`/`FieldDescription`, `InputGroup`, `FieldSet`/`FieldLegend`, `Spinner`. Ação: instalar via CLI e refatorar os formulários para `FieldGroup` + `Field`, com validação em `data-invalid` (no `Field`) + `aria-invalid` (no controle), e conjuntos de 2–7 opções via `ToggleGroup`.

### 7.3. Como isso se reconcilia com a identidade visual (§6)

Não há conflito entre "ter identidade própria" (§6) e "ficar dentro do shadcn": **a distinção mora nos tokens de tema e na composição, não em overrides por `className`.**

- A paleta petróleo/papel/âmbar e a tipografia (display/body/mono) entram como **variáveis CSS de tema** (e fontes), aplicáveis via preset shadcn (`npx shadcn@latest apply <code> --only theme,font`) ou editando o CSS de tema — uma vez só, e todos os componentes herdam.
- Status (rascunho/concluído/**herdado**) saem como **`Badge` variants**, não spans coloridos.
- O **elemento-assinatura** (visualização da herança ao longo da cadeia) é um componente próprio em `features/`, mas **composto de primitives shadcn** (`Card`, `Badge`, `Separator`, `Tooltip`, `Breadcrumb`/stepper), respeitando os tokens.

### 7.4. Componentes por superfície

- **Construtor de modelos:** `Field`/`FieldGroup`, `Table`, `Tabs`, `Dialog`/`Sheet`, `Select`, `ToggleGroup`, `Switch`.
- **Wizard de documento:** `Field`/`FieldGroup`, `Progress` (stepper), `Sheet` (assistente de IA), `Alert` (validações), `Empty` (vazios), `Spinner` (geração por IA).
- **Dashboard:** `Card` + `Chart` + `Table` + `Badge` (tudo já instalado).
- **Listagem:** `Table` + faceted filters (a `data-table` de `shared/` já cobre).
- **Cadeia/herança:** `Card` + `Badge` + `Separator` + `Tooltip` + `Breadcrumb`/stepper.

### 7.5. Fluxo de trabalho

Operar sempre pela CLI/MCP do shadcn — `search` para achar, `docs` para a API correta antes de codar, `add` para instalar, `--dry-run`/`--diff` para atualizar — e **nunca baixar arquivos crus do GitHub**. Registries sempre explícitos (não adivinhar). Após adicionar qualquer item, revisar o arquivo e corrigir composição/ícones para os padrões do projeto (lucide, aliases `@/shared/...`, sem `"use client"` por ser SPA Vite).

---

## 8. Calibração anti-slop (skill `taste-skill`)

Esta skill é focada em landing pages/portfólios e se declara **fora de escopo para dashboards, tabelas e UI de produto multi-etapas** — que é exatamente o nosso caso. Por isso aplicamos só os **princípios transversais** (calibração de design, anti-default, estados, copy) e **ignoramos as regras específicas de landing** (disciplina de hero, bento, racionamento de eyebrow etc.).

### 8.1. Design Read (declarar antes de desenhar)

> *"Lendo isto como: **produto de fase preparatória de contratação pública** para servidores (Sustentação + requisitante), com linguagem **trust-first / institucional sóbria**, apoiada em **shadcn/ui + tokens próprios + movimento contido**."*

O ponto-chave da skill: público de **setor público/regulado é uma restrição que se sobrepõe à preferência estética**. A confiança e a clareza vêm antes da ousadia visual.

### 8.2. Os três "dials" (e a reconciliação com a §6)

Para um produto trust-first/público, a skill recomenda calibrar **para baixo**:

- **DESIGN_VARIANCE: 3–4** (não 8) — layout disciplinado, previsível.
- **MOTION_INTENSITY: 2–3** — movimento só onde comunica (revelar a herança entre etapas); nada decorativo.
- **VISUAL_DENSITY: 4–5** — formulários e tabelas densos, mas respiráveis.

Isto **tempera** a recomendação da `frontend-design` ("assuma um risco estético real"): o **elemento-assinatura (herança na cadeia) permanece**, mas executado com **sobriedade**, sem flourish. Para este público, a contenção *é* a escolha de design correta.

### 8.3. Correções concretas que a skill aplicou ao plano

1. **Paleta:** a versão anterior (papel creme `#FAF8F3` + âmbar/brass `#C6783C`) caía direto na família que a skill **bane como AI-default** para visual "premium-quente". Revisada para **um único acento petróleo travado + neutros frios** (ver §6.3).
2. **Tipografia:** a serifa dos protótipos (Georgia) é um *AI tell* para produto não-editorial → trocada por **sans display + body legível + mono para códigos** (ver §6.3).
3. **Sem AI-tells de cor:** sem neon/glow, sem preto puro `#000`, sem gradiente roxo "de IA", máximo **1 acento** travado na página inteira.
4. **Ícones:** a skill desencoraja lucide, mas permite quando o projeto já depende dele — o nosso depende (config shadcn), então **mantemos lucide**.

### 8.4. Estados e formulários (obrigatórios)

Sempre implementar o ciclo completo, não só o "sucesso": **loading** com skeletons no formato do conteúdo, **vazio** como convite, **erro** inline no formulário. Em formulários: **label acima do campo**, nunca placeholder-como-label, **erro abaixo**; checar contraste WCAG AA de botões, inputs, placeholders e foco. (Casa com as primitivas `Field` do shadcn, §7.2.)

### 8.5. Disciplina de conteúdo e copy

- **Banimento de em-dash (`—`/`–`)**: regra não-negociável da skill; usar hífen, vírgula, dois-pontos ou frases separadas. Vale para UI, labels, botões e dados mock.
- **Sem dados "Jane Doe"**: nomes realistas e **brasileiros** (a base já faz isso bem — Marina Albuquerque, Sede Recife), nada de "John Doe"/"Acme".
- **Sem números falso-precisos** não rotulados; dados mock devem ser plausíveis e marcados como exemplo.
- **Sem verbos-clichê** ("Eleve", "Seamless", "Revolucione"); verbos concretos na voz da requisitante.
- **Um registro de copy por tela**, consistente ponta a ponta (reforça §6.5).

---

## 9. Register de produto e processo de craft (skill `impeccable`)

Esta skill traz a peça que faltava: ela separa **register de marca** (design *é* o produto: landing/portfólio) de **register de produto** (design *serve* o produto: app, dashboard, ferramenta, formulários). O nosso caso é **inteiramente register de produto** — e isso reenquadra todo o objetivo de design.

### 9.1. O "teste de slop" muda — e isso reconcilia as skills

No register de produto, o teste **não** é "alguém diria que foi IA que fez". Aqui **familiaridade é uma vantagem**. O teste é: *um usuário fluente nas melhores ferramentas da categoria (Linear, Figma, Notion, Stripe) sentaria e confiaria nesta interface, ou travaria em cada componente sutilmente estranho?* O modo de falha do produto não é "chapado/sem graça", é **estranheza sem propósito**.

Isso **resolve a tensão** entre as skills anteriores: a `frontend-design` pedia ousadia; a `taste-skill` mandava calibrar para baixo; a `impeccable` explica *por quê* para o nosso caso — a meta é **familiaridade conquistada**, a ferramenta sumindo na tarefa. A ousadia vira **momento** (a assinatura de herança), não a linguagem da página inteira.

### 9.2. Refinos concretos ao plano

- **Tipografia:** uma **só família sans** carrega tudo; sem par display/body; escala **rem fixa** (não fluida). Refinou a §6.3.
- **Cor (register de produto = "Restrained"):** neutros levemente tingidos + **um acento ≤10%**, usado só em ação primária, seleção atual e indicadores de estado — **nunca decoração**. Uma **segunda camada neutra** (levemente mais fria/quente) para sidebar/toolbars/painéis. Reforça e detalha a §6.3.
- **Vocabulário de estado padronizado:** hover, focus, active, disabled, selected, loading, error, warning, success, info — **todo** componente interativo entrega o ciclo completo (casa com §7 e §8.4).
- **Movimento:** 150–250 ms, transmite estado (não decoração), **sem sequência coreografada de page-load**. Reforça o MOTION baixo da §8.2.
- **Modal por último:** no register de produto, modal "como primeiro pensamento" é preguiça — esgotar alternativas inline/progressivas primeiro. Vale para o wizard e o construtor de modelos.
- **OKLCH:** a base já usa OKLCH no tema (`theme.css`) — exatamente o que a skill exige. E a skill bane independentemente o **creme/areia/bege** como default (mesma armadilha que a `taste-skill` já tinha apontado): duas skills, o mesmo alerta.

### 9.3. Bans absolutos a fiscalizar na base

Ao reaproveitar componentes, auditar e remover: **borda-faixa lateral** (`border-left` colorido em cards/alerts), **texto com gradiente**, glassmorphism decorativo, **grids de cards idênticos**, eyebrow em toda seção, **card "fantasma"** (borda 1px + sombra ≥16px juntos), e **cards super-arredondados** (raio de card no teto de 12–16px; o tema atual usa ~10px, OK). Numeração de seção só onde há sequência real — e DFD → ETP → TR **é** sequência real, então a numeração 1·2·3 da cadeia é legítima.

### 9.4. Processo e artefatos sugeridos

A `impeccable` opera por comandos que se encaixam bem no faseamento: **`shape`** (planejar UX antes de codar) por feature, **`craft`** (construir ponta a ponta), depois **`critique`/`audit`/`polish`** antes de fechar. Recomendo, ao criar o fork (Fase 0), gerar dois artefatos que essa skill mantém: **`PRODUCT.md`** (o que é o produto, register, público) e **`DESIGN.md`** (tokens, tipografia, regras) — viram a fonte de verdade do design system do novo produto.

### 9.5. Honestidade sobre o "reflexo de categoria"

A skill pede um teste de segundo nível: se dá para adivinhar a estética só pela categoria + anti-referência, ainda é reflexo. "Ferramenta de governo que **não** é azul-marinho → teal/petróleo institucional" é justamente o petróleo que propusemos. Para um **produto interno** isso importa menos (familiaridade > novidade), mas fica o registro honesto: vale pressionar a escolha de acento na fase de tokens, em vez de assumir o petróleo como certo.

---

## 10. Adaptação multi-contexto e estratégia de cor (skills `impeccable: adapt` + `colorize`)

### 10.1. Adaptação (`adapt`) — repensar por contexto, não escalar pixels

O princípio da skill: adaptar é **repensar a experiência** para cada contexto, não encolher a tela. Para o nosso produto, o realismo manda **declarar o contexto primário por superfície**:

- **Construtor de modelos e formulários longos (DFD/ETP/TR):** tarefa **desktop-first** — telas largas, muitos campos, tabelas de itens. No mobile, não esconder função; usar **divulgação progressiva** (acordeões por seção), stepper colapsado e formulário em coluna única.
- **Dashboard e listagem:** desktop confortável; no mobile, a `data-table` vira **cards** (`display:block` + `data-label`), e os filtros viram bottom sheet.
- **Assistente de IA (hoje um `Sheet` lateral):** no mobile, **bottom sheet**.
- **Detecção de input, não só de tela:** usar `@media (pointer: coarse)` para alvos de toque ≥44px e `@media (hover: hover)` para não pendurar função em hover (um notebook com toque existe). Breakpoints **dirigidos pelo conteúdo** (≈640/768/1024), não por dispositivo.

**Aplicação mais específica e valiosa — impressão/PDF:** DFD, ETP e TR são **documentos oficiais** que serão impressos e exportados. A `view` do documento merece **adaptação de impressão de verdade** (`@media print`): remover navegação/sidebar/ações, quebras de página lógicas, cabeçalho/rodapé com identificação e número do documento, e a herança consolidada em texto. Isso conversa com o `document-export.ts` que já existe na base.

**Aprofundamento (2ª passada da skill):**

- **Não assumir que desktop = máquina potente.** Este é o ponto mais relevante para o nosso público: estações de trabalho do setor público costumam ser **antigas, de baixo desempenho e em conexões lentas**. Definir um **orçamento de performance**, testar com **rede limitada (throttling)** e em hardware modesto, e evitar render pesado nas tabelas/wizard. Conversa com a §9.2 (sem coreografia de page-load) e com a futura fase de `optimize`.
- **CSS mobile-first:** escrever o estilo base para a tela menor e **somar** com `min-width` (não desktop-first com `max-width`), para o mobile não baixar estilo desnecessário.
- **Mesma arquitetura de informação em todos os contextos.** Nada de um fluxo mobile divergente: os mesmos substantivos, a mesma hierarquia, a mesma jornada DFD → ETP → TR em qualquer tela (reforça a uniformidade da §11).
- **Tablet = master-detail:** lista de documentos + visualização lado a lado, adaptando por orientação (retrato/paisagem). Não esquecer **paisagem** no mobile.
- **Safe areas / notch** (`env(safe-area-inset-*)` + `viewport-fit=cover`) caso o mobile entre em escopo de uso real.
- **Testar em dispositivo real**, não só no emulador do DevTools (toque, fonte, performance e o teclado virtual mudam o resultado).

Fora de escopo para nós: e-mail, watch, TV e imagens responsivas pesadas (o produto é de formulário, quase sem mídia).

### 10.2. Estrutura de cor (`colorize`) — Restrained, semântica, coesa

O register de produto é **semantic-first e Restrained**: acento só em ação primária, seleção atual e indicadores de estado — **nunca decoração** — com significado consistente em todas as telas. Estrutura concreta da paleta (em OKLCH, como a base já usa):

- **Primary:** 1 cor (petróleo), 3–5 tons.
- **Neutral:** escala de 9–11 tons **tingida em direção ao hue do petróleo** (chroma 0.005–0.015) — não cinza puro, **não** quente por reflexo. Isso cria coesão subliminar entre marca e superfícies.
- **Semantic:** success/error/warning/info, 2–3 tons cada, com **significado fixo** em todo o app.
- **Surface:** 2–3 níveis de elevação (no dark, profundidade vem de **superfície mais clara**, não de sombra; dessaturar acento e reduzir o peso do body para ~350).
- **Regra 60-30-10** por peso visual: neutros 60%, texto/bordas/inativos 30%, acento ~10%. O acento funciona **porque é raro**.

Aplicações no nosso domínio:

- **Status dos documentos** (rascunho / concluído / **herdado**): `Badge` com **cor + ícone + label** (nunca cor sozinha — 8% dos homens têm daltonismo). 
- **Indicador de herança:** usar **lavagem de superfície** (4–8% do acento) ou hairline completo, **nunca borda-faixa lateral** (`border-left`/`right` >1px é ban absoluto).
- **Tokens em duas camadas:** primitivos (`--teal-600`) + semânticos (`--color-primary`); no dark, redefinir só a camada semântica.
- **Contraste WCAG** verificado: body ≥4.5:1, texto grande/UI ≥3:1, placeholder ≥4.5:1; nada de cinza claro "por elegância". Evitar abuso de alpha (sintoma de paleta incompleta) — definir cores de overlay explícitas.

Isto **detalha** (não muda) a direção já fixada nas §6.3/§8.3/§9.2: acento único petróleo, neutros frios, cor a serviço do significado.

---

## 11. Definição de Pronto e disciplina de polish (skill `impeccable: polish`)

A `polish` não é maquiagem: ela exige **alinhamento ao design system primeiro** ("polish sem alinhamento é decoração sobre desvio"). Aplicações concretas ao nosso reaproveitamento:

- **Classificar todo desvio por causa-raiz** ao reusar/adaptar componentes da base: *token faltando* (corrigir o valor), *implementação avulsa* (trocar pelo componente compartilhado já existente) ou *desalinhamento conceitual* (refazer o fluxo). Reusar o TR sem isso faz o desvio acumular. O `DESIGN.md` (§9.4) é a régua.
- **Consistência de IA e de forma entre DFD, ETP, TR e o construtor:** mesma divulgação progressiva, mesma forma de fluxo (inline vs rota vs modal; salvar-no-blur vs submit explícito), mesmo peso visual para a mesma ação primária, e os **mesmos substantivos/verbos** em todas as telas (não chamar de "Modelo" aqui e "Template" ali). Em um produto com 3 documentos quase irmãos, essa uniformidade é o que gera confiança.
- **Adotar a checklist de polish como Definição de Pronto por fase:** alinhado ao design system; IA/fluxo coerentes com as telas vizinhas; alinhamento e espaçamento por token em todos os breakpoints; **todos os estados** interativos (default/hover/focus/active/disabled/loading/error/success); transições 150–300 ms com ease-out; copy consistente; formulários rotulados e validados; estados de erro/loading/vazio tratados; alvos de toque ≥44px; contraste WCAG AA; navegação por teclado e foco visível; sem erro de console; sem layout shift; `prefers-reduced-motion` respeitado; código limpo (sem TODO/console.log/morto).
- **Triagem cosmético vs. funcional** quando o tempo aperta (funcional primeiro), com **qualidade consistente** (não perfeiçoar um canto e deixar outro bruto). Polir só o que já está funcionalmente completo.
- **Limpeza ao final de cada fase:** trocar reimplementações por componentes do design system, remover código órfão do TR que não serve ao novo produto, consolidar tokens novos e eliminar duplicação.

## 12. UX writing e glossário canônico (skill `impeccable: clarify`)

Num produto de 3 documentos encadeados, **a linguagem é a espinha dorsal**: o mesmo termo precisa significar a mesma coisa em toda tela. A `clarify` orienta:

- **Glossário canônico (escolher um termo e manter):** ponto de partida proposto — *Modelo* (não "template"), *Documento*, *DFD/ETP/TR*, *Herança*/*herdado* (não "vínculo"/"cópia"), *Unidade requisitante*, *Responsável*, *Objeto*, *Justificativa*, *Vínculo ao PCA*, *Concluir* (não "finalizar"/"enviar"), *Salvar rascunho*, *Excluir* (permanente, não "remover"). Versionar isso no `DESIGN.md`.
- **Botões = verbo + objeto, com toast espelhado:** "Concluir DFD" → toast "DFD concluído"; "Salvar rascunho" → "Rascunho salvo". Nada de "OK"/"Enviar".
- **Erros pela fórmula (o que houve + por quê + como resolver), sem culpar o usuário:** "O campo Objeto é obrigatório." / "A data prevista precisa estar em dd/mm/aaaa. Exemplo: 30/06/2026." em vez de "Entrada inválida".
- **Estados vazios como onboarding:** "Nenhum DFD ainda. Crie o primeiro para iniciar a cadeia." em vez de "Sem itens".
- **Loading com expectativa**, sobretudo na IA: "Levantando o mercado no PNCP e no repositório… costuma levar de 30 a 60 s." em vez de "Carregando…".
- **Confirmação só para ação destrutiva, com a ação nomeada:** "Excluir o modelo 'TR de Consultoria'? Não dá para desfazer." e botões "Excluir modelo" / "Manter". Para o resto, preferir **desfazer** a confirmar.
- **Help text agrega valor** (não repete o label) em campos não óbvios (PCA, levantamento de mercado), e **label sempre acima do campo** (nunca placeholder como único rótulo — casa com §7.2 e §8.4).
- A base já acerta no idioma e no tom institucional brasileiro; o trabalho é **padronizar e auditar** a cada tela (uma passada de copy antes de fechar cada fase).

---

## 13. Espaço, ritmo e estrutura (skill `impeccable: layout`)

"Espaço é o material de design mais subutilizado." No register de produto, o layout é **grid previsível, densidade consistente, navegação familiar** — e responsividade **estrutural** (colapsar sidebar, tabela responsiva), não tipografia fluida. Contribuições concretas:

- **Escala de espaçamento 4pt + ritmo:** todo espaçamento sai de uma escala fixa (4, 8, 12, 16, 24, 32, 48, 64, 96) — a base já usa o scale 4px do Tailwind v4, então é só **proibir valores arbitrários**. Ritmo: **agrupamento apertado** entre campos irmãos (8–12px) e **separação generosa** entre seções do documento (48–96px). Isso casa direto com a estrutura `FieldGroup`/`Field` (§7.2) e dá legibilidade aos formulários longos de DFD/ETP/TR.
- **Container queries nos componentes reaproveitáveis:** a base já adota `@container/content` no layout autenticado — estender isso para os componentes do novo produto (card de herança, blocos de seção do documento, KPI cards), para que se adaptem ao **contêiner** (sidebar estreita vs. conteúdo largo), não só ao viewport. Flex para 1D, Grid para 2D, áreas nomeadas para a estrutura de página.
- **Disciplina de cards (dois bans a corrigir na base):** o dashboard atual tem **4 KPI cards idênticos**, que caem em "grid de cards idênticos" + "template hero-métrica". Redesenhar com **variação e ritmo** (tamanhos/spans diferentes, ou métrica + mini-gráfico), exibindo **dado real** (mock realista), não número decorativo. E regra dura: **nunca aninhar card dentro de card** — no wizard, uma seção que vira card não pode conter sub-cards; usar espaçamento e divisores para hierarquia interna.
- **Hierarquia por 2–3 dimensões** (tamanho + peso + espaço; razão de tamanho ≥3:1 para forte). Espaço sozinho já cria hierarquia; cor/elevação só quando o espaço não basta. Escala de sombra sutil, elevação reforçando hierarquia, não decoração.
- **Squint test como verificação:** com a visão "borrada", dá para identificar o elemento primário, o secundário e os agrupamentos em 2 s? Entra na Definição de Pronto (§11).

---

## 14. Planejar cada feature antes de codar (skill `impeccable: shape`)

A `shape` produz um **design brief por feature** antes de qualquer código, via entrevista de descoberta — encaixa direto no seu "plano primeiro" e no fluxo `shape → craft` (§9.4). Recomendação: cada superfície nova (construtor de modelos, wizard de cada documento, view de herança, dashboard) ganha um brief curto antes de implementar, com: resumo da feature, **ação primária única**, direção (estratégia de cor + uma frase-cena de contexto físico + 2–3 referências nomeadas, não adjetivos), escopo (fidelidade/abrangência/interatividade), estratégia de layout, **todos os estados** (default/vazio/loading/erro/sucesso/edge), modelo de interação, requisitos de conteúdo (copy puxada do glossário §12), referências recomendadas e perguntas em aberto. Regra da skill que vale adotar: **apresentar o brief e parar para confirmação** antes de codar.

## 15. Movimento (skill `impeccable: animate`)

Register de produto: 150–250 ms, movimento transmite **estado** (não decoração), sem coreografia de page-load. Concreto:

- **Regra 100/300/500:** ~100–150 ms para feedback (clique/toggle), 200–300 ms para mudança de estado (menu/tooltip/hover), 300–500 ms para mudança de layout (acordeão/sheet). Saída ~75% da entrada.
- **Curvas ease-out** (quart/quint/expo) como tokens; **nunca bounce/elastic** (datado).
- **Uma assinatura, não enfeite espalhado:** o único "momento" é a **revelação da herança** (o campo que aparece marcado como herdado ao avançar DFD → ETP → TR), com ease-out e ≤300 ms. Todo o resto é transição de estado (foco de input, validação, expand/collapse de seção, entrada do sheet do assistente).
- **Stagger** só em lista/grid de cards, com teto (10×50 ms = 500 ms) via `--i`; fade-on-scroll de seção inteira é tell — não usar.
- **Performance percebida:** UI otimista só em ações de baixo risco, **nunca** em Concluir/Excluir; skeleton no lugar de spinner.
- `prefers-reduced-motion` obrigatório.

## 16. Robustez de produção (skill `impeccable: harden`)

"Design que só funciona com dado perfeito não está pronto." Cabível ao nosso domínio:

- **Texto longo em documentos oficiais:** objeto/justificativ