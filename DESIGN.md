# DESIGN.md

> Sistema de design do produto: tokens, tipografia, regras de cor/movimento/layout, glossário canônico de termos e a Definição de Pronto. Acompanha o `PRODUCT.md`. Síntese de seis lentes (`frontend-design`, `shadcn`, `taste-skill` e `impeccable`). Detalhes e justificativas em `PLANO-REAPROVEITAMENTO.md`.

## Design Read e dials

> Lendo isto como: **produto de fase preparatória de contratação pública** para servidores (Sustentação + requisitante), com linguagem **trust-first / institucional sóbria**, sobre **shadcn/ui + tema Nature + movimento contido**.

Dials (público público/trust-first → calibrados para baixo): **DESIGN_VARIANCE 3–4 · MOTION 2–3 · DENSITY 4–5**.

## Princípios

1. **Familiaridade conquistada.** A ferramenta some na tarefa; confiança antes de ousadia.
2. **Uma única assinatura.** Toda a ousadia mora num elemento: a **visualização da herança** na cadeia DFD → ETP → TR. O resto é sóbrio e disciplinado.
3. **Identidade via tokens, não overrides.** A distinção visual vive nas variáveis de tema e na composição de primitives shadcn, nunca em `className` de cor.
4. **Cor a serviço do significado.** Acento (verde da marca) usado em ação primária, seleção e estado — não decoração.
5. **Carga cognitiva baixa.** ≤4 itens por bloco; herança visível reduz recall.

## Cor — tema Nature (definido)

**Tema definido pelo time: Nature (tweakcn).** Verde institucional como `--primary` (hue ~144), neutros claros levemente quentes de baixíssima chroma (hue ~80, **near-neutral**, não o creme saturado dos AI-defaults), escuro tingido de verde (hue ~147–150). Fonte canônica dos valores: **`src/app/styles/theme.css`** (claro + escuro, em OKLCH). Não duplicar valores aqui; editar sempre o `theme.css`.

Caráter da paleta:

- **Primary (verde):** `oklch(0.5234 0.1347 144)` no claro, `oklch(0.6731 0.1624 144)` no escuro. Foco (`--ring`) = primary.
- **Superfícies claras:** background/card `oklch(0.9711 0.0074 80)`; sidebar/muted um degrau mais quente `oklch(0.937 …)`.
- **Escuro:** profundidade por superfície mais clara (card `0.3327` sobre bg `0.2683`), acento dessaturado, near-black tingido de verde.
- **Charts:** rampa monocromática de verdes (chart-1…5) — coesa, sem arco-íris.
- **Sombras:** escala `--shadow-2xs … --shadow-2xl` definida no tema (sutil, opacity ~0.1); usar para reforçar hierarquia, não decorar. **Radius 0.5rem** (teto de card 12–16px respeitado).

**Contraste verificado (WCAG AA, claro + escuro):** todos os pares principais passam ≥4.5:1 — primary-foreground sobre primary 5.1:1, foreground sobre background 12.7:1, muted-foreground sobre muted 6.3:1, secondary/accent/destructive idem. Reverificar com checker a cada novo par antes de fechar (Definição de Pronto).

### Cores semânticas de estado (significado fixo em todo o app)

O tema traz `--destructive`. Estas complementam-no; como a marca já é verde, **distinguir sempre por ícone + label**, nunca por cor isolada.

| Estado | Uso | Direção OKLCH |
|---|---|---|
| Success | concluído, validado | `oklch(0.52 0.12 150)` (verde, distinto do primary por contexto+ícone) |
| Warning | atenção, pendência | `oklch(0.70 0.13 75)` (âmbar) |
| Error | erro, destrutivo | `--destructive` |
| Info | informação neutra | `oklch(0.55 0.09 230)` (azul) |

### Status dos documentos (sempre cor + ícone + label, nunca cor sozinha)

- **Rascunho** → `Badge` neutro (secondary/outline) + ícone de lápis.
- **Concluído** → success + ícone de check.
- **Herdado** → **lavagem de superfície do acento verde (4–8%)** + ícone de elo. **Nunca** borda-faixa lateral (`border-left`/`right` > 1px é ban absoluto).

## Tipografia

Definida pelo tema Nature (carregada self-hosted via `@fontsource-variable/*` em `index.css`):

- **Sans — Montserrat (`--font-sans`):** carrega a UI inteira — títulos, labels, botões, body e dados. É a fonte de trabalho do produto.
- **Serif — Merriweather (`--font-serif`):** disponível como token, **reservada para momentos editoriais específicos** (ex.: corpo do documento na visualização/impressão do DFD/ETP/TR, dando peso de artefato oficial). **Nunca** em labels, botões ou dados de UI.
- **Mono — Source Code Pro (`--font-mono`):** só para códigos/protocolos (`DFD-2026-014`, item do PCA, valores `R$`).
- **Escala em rem fixa** (não `clamp()` fluida), razão curta 1.125–1.2. Body 65–75ch para prosa; tabelas podem rodar mais densas. `text-wrap: balance` em títulos, `pretty` em prosa longa.

## Espaço e layout

- **Escala 4pt** (4, 8, 12, 16, 24, 32, 48, 64, 96) — a base já usa o scale 4px do Tailwind v4. **Proibido valor arbitrário.**
- **Ritmo:** agrupamento apertado entre campos irmãos (8–12px), separação generosa entre seções do documento (48–96px). Usar `gap`, não margens.
- **Container queries** nos componentes reaproveitáveis (a base já usa `@container/content`): card de herança, blocos de seção, KPI cards se adaptam ao contêiner, não só ao viewport.
- **Cards com disciplina:** nunca aninhar card em card; corrigir os 4 KPI cards idênticos do dashboard (variar tamanho/span, métrica + mini-gráfico, dado real). Flex 1D / Grid 2D / áreas nomeadas.
- **Hierarquia** por 2–3 dimensões (tamanho ≥3:1 + peso + espaço). Validar pelo **squint test**.

## Movimento

- Register de produto: **150–250 ms**, transmite **estado** (não decoração). **Sem coreografia de page-load.**
- Regra **100/300/500**: ~100–150 ms feedback, 200–300 ms estado, 300–500 ms layout. Saída ~75% da entrada.
- **Curvas ease-out** (sem bounce/elastic). A base já define `--ease-emil-out/in-out/drawer` em `index.css`; usá-las.
- **Assinatura única:** revelação da herança ao avançar DFD → ETP → TR (campo aparece marcado como herdado, ease-out, ≤300 ms). Todo o resto é transição de estado.
- `prefers-reduced-motion` obrigatório (a base já tem o bloco global em `index.css`).

## Elemento-assinatura: a herança

O único "momento" do produto. Especificação:

- **O quê:** ao gerar o documento seguinte, os campos comuns aparecem pré-preenchidos, marcados como *herdado* (lavagem de acento verde 4–8% + ícone de elo) e tornam-se *ajustado* se editados.
- **Por quê (duplo propósito):** identidade visual **e** redução de carga cognitiva — mata *Memory Bridge* (lembrar o DFD para preencher o ETP) e *Context Switch* (pular de tela). O contexto herdado fica **visível e co-locado**.
- **Como:** componente próprio em `features/`, **composto de primitives shadcn** (`Card`, `Badge`, `Separator`, `Tooltip`, breadcrumb/stepper), respeitando os tokens. Movimento conforme a assinatura acima.

## Glossário canônico

Um termo, um significado, em toda tela (UI, botões, toasts, mensagens). Variação é proibida.

| Use | Não use |
|---|---|
| Modelo | template |
| Documento | registro, formulário |
| DFD / ETP / TR | siglas trocadas ou por extenso inconsistente |
| Herança / herdado | vínculo, cópia |
| Ajustado | editado, alterado (no contexto de herança) |
| Unidade requisitante | setor, secretaria (na UI) |
| Responsável | dono, owner |
| Objeto | descrição |
| Justificativa | motivação |
| Vínculo ao PCA | PCA, plano |
| Concluir | finalizar, enviar, submeter |
| Salvar rascunho | salvar |
| Excluir | remover, apagar |
| Sustentação | admin, suporte |
| Requisitante | usuário, operador |

## Texto de interface (UX writing)

- **Botão = verbo + objeto**, com toast espelhado: "Concluir DFD" → "DFD concluído"; "Salvar rascunho" → "Rascunho salvo". Nunca "OK"/"Enviar".
- **Erro = o que houve + por quê + como resolver, sem culpar:** "A data prevista precisa estar em dd/mm/aaaa. Exemplo: 30/06/2026."
- **Vazio = onboarding:** "Nenhum DFD ainda. Crie o primeiro para iniciar a cadeia."
- **Loading com expectativa** (IA): "Levantando o mercado no PNCP e no repositório… costuma levar de 30 a 60 s."
- **Confirmação só para destrutivo, ação nomeada:** "Excluir o modelo 'TR de Consultoria'? Não dá para desfazer." → botões "Excluir modelo" / "Manter". Para o resto, preferir **desfazer**.
- **Label sempre acima do campo** (nunca placeholder como único rótulo). Help text agrega valor, não repete o label.

## Conformidade shadcn

- Projeto já é shadcn (new-york, Radix, Tailwind v4, lucide, MCP em `.mcp.json`). Operar pela CLI/MCP (`search`/`docs`/`add`/`--diff`), nunca baixar arquivo cru do GitHub.
- **Formulários nas primitivas a instalar:** `Field`/`FieldGroup`/`FieldLabel`/`FieldDescription`, `InputGroup`, `FieldSet`/`FieldLegend`, `Spinner`. Validação: `data-invalid` no `Field` + `aria-invalid` no controle. Conjuntos 2–7 opções via `ToggleGroup`.
- Tokens semânticos, nunca cor crua; `className` só para layout; `gap` não `space-y`; `size-*` quando largura=altura; `cn()` para condicional; sem `z-index` manual em overlay; sem `dark:` manual.
- Componentes em vez de markup: `Alert` (callout), `Empty` (vazio), `Badge` (status), `Separator`, `Skeleton`, `sonner` (toast).
- Ícones: **lucide** (família única; o projeto já depende).

## Bans absolutos a fiscalizar

Borda-faixa lateral; texto com gradiente; glassmorphism decorativo; grids de cards idênticos; template hero-métrica; eyebrow em toda seção; card "fantasma" (borda 1px + sombra ≥16px); cards super-arredondados (teto 12–16px; tema usa 0.5rem); segundo acento competindo com o verde; em-dash (`—`/`–`) na UI (usar hífen). Numeração de seção só onde há sequência real — DFD → ETP → TR é sequência real, então é legítima na cadeia.

## Definição de Pronto (por feature/fase)

Marcar tudo antes de fechar:

- [ ] Alinhado ao design system; cada desvio classificado por causa-raiz (token faltando / implementação avulsa / desalinhamento de fluxo) e resolvido.
- [ ] IA, fluxo e linguagem coerentes com as telas vizinhas (mesmos substantivos do glossário).
- [ ] Alinhamento e espaçamento por token em todos os breakpoints; sem valor arbitrário.
- [ ] Hierarquia passa no **squint test** (primário/secundário/agrupamentos em 2 s).
- [ ] **Todos os estados** de cada componente interativo: default, hover, focus, active, disabled, loading, error, success.
- [ ] Transições 150–300 ms, ease-out; `prefers-reduced-motion` respeitado; movimento só de estado (exceto a assinatura).
- [ ] Carga cognitiva: ≤4 campos por bloco antes de quebra; 1 ação primária + 1–2 secundárias; herança visível e co-locada.
- [ ] Formulários nas primitivas `Field`; label acima; erro abaixo pela fórmula; validação preserva o que foi digitado.
- [ ] Estados de vazio (onboarding), loading (skeleton + expectativa) e erro (recuperação) tratados.
- [ ] Copy revisada contra o glossário; botão verbo+objeto com toast espelhado; sem em-dash.
- [ ] Robustez: texto 100+ chars sem quebrar; formatos `pt-BR` via `Intl`; anti-duplo-submit; somente-leitura em documento concluído.
- [ ] A11y: navegação por teclado, foco visível, alvos ≥44px, contraste WCAG AA (body ≥4.5:1, grande/UI ≥3:1, placeholder ≥4.5:1), status não depende só de cor.
- [ ] Responsivo: contexto primário por superfície respeitado; tabela→cards no mobile; sidebar colapsa; sem scroll horizontal.
- [ ] Impressão/PDF dos documentos (`@media print`) quando aplicável.
- [ ] Sem erro de console; sem layout shift no load; código limpo (sem TODO/console.log/morto).

## Portões de avaliação

- **Por feature:** `shape` (brief com estados e conteúdo) antes de codar → implementar → `critique` (heurística: carga cognitiva, Nielsen, personas Ana/Sustentação/Sam) + `audit` (técnica: nota /20, P0–P3) → `polish`.
- **Meta de `audit`:** faixa Excelente (18–20); tratar P0/P1 antes de fechar.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              