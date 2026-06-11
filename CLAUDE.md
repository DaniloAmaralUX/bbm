# CLAUDE.md

Manual operacional para agentes (Claude Code) trabalhando neste repositório. Leia este arquivo primeiro.

## O que é este projeto (enquadramento)

Este é um projeto de **transformação de produto** (brownfield), não um greenfield. Estamos pegando a engenharia de um produto existente — o **"TR Fácil"** (app de Termos de Referência) — e generalizando-a para um **produto novo e maior**: uma plataforma da **fase preparatória da contratação pública** que cobre a cadeia **DFD → ETP → TR**, com construtor de modelos, herança controlada de informações e apoio de IA.

Regra mental central:
- **Reaproveitar a engenharia, não a identidade.** As camadas `src/app/` e `src/shared/` (router, providers, UI shadcn, data-table, layout, hooks) são genéricas e devem ser preservadas quase intactas.
- **`src/features/tr/` é a FONTE a generalizar, não o alvo.** O motor de templates, o wizard e o assistente que existem lá são o protótipo, em escala menor, do que o novo produto generaliza para `DocType` (DFD/ETP/TR).
- O esforço é: introduzir o **tipo de documento**, transformar **modelos de constante em dado editável** (construtor) e tornar a **herança** visível e rastreável.

## Ordem de leitura dos documentos

1. `PRD.md` — requisitos, escopo do v0, faseamento e critérios de aceite.
2. `PRODUCT.md` — produto, register, personas (Ana, Sustentação, Sam).
3. `DESIGN.md` — sistema de design: tokens (tema Nature), tipografia, glossário canônico, regras e a **Definição de Pronto**.
4. `PLANO-REAPROVEITAMENTO.md` — análise de reuso (o que preservar/generalizar/remover) e decisões.
5. `prototypes/fase1-cadeia-heranca.html` — protótipo de validação da herança DFD→ETP→TR; espelhe esse comportamento na implementação.

## Comandos

- `pnpm dev` — ambiente local.
- `pnpm build` — build de produção (`tsc -b && vite build`).
- `pnpm typecheck` — tipagem.
- `pnpm lint` / `pnpm format:check` / `pnpm format` — ESLint e Prettier.
- `pnpm knip` — arquivos/dependências não usados.
- `pnpm check` — sequência completa (lint + format + knip + typecheck). **Rode antes de fechar qualquer tarefa.**

Stack: React 19 + TypeScript, Vite, TanStack Router/Query/Table, Zustand, Tailwind v4, shadcn/ui (new-york, Radix), Recharts, Zod. Tema **Nature** (verde), fontes Montserrat/Merriweather/Source Code Pro.

## Arquitetura

**Atual**
```
src/
  app/          bootstrap, router, providers, contexts, query-client  (genérico — preservar)
  shared/       layout (sidebar/header), ui/ (shadcn), data-table, hooks, lib  (genérico — preservar)
  features/tr/  domínio TR: dashboard, list, wizard, view, data/(templates, assistant, schema)  (GENERALIZAR)
  routes/       rotas TanStack
```

**Alvo (após Fase 1+)**
```
src/
  app/                  (inalterado)
  shared/               (inalterado; instalar primitivas Field do shadcn)
  features/documents/   motor genérico por DocType (dfd|etp|tr): wizard, view, data
  features/models/      construtor de modelos (perfil Sustentação)
  features/dashboard/   KPIs e listagem multi-tipo
```

`DocType = 'dfd' | 'etp' | 'tr'` é dimensão de primeira classe. Modelos viram **dado editável** (não constantes). Documentos têm `parentId` (cadeia) e herança via `inheritCommonFields(source, targetModel)`.

## Como trabalhar (fluxo por fase)

Siga o faseamento do `PRD.md` (Fase 0 feita). Para **cada feature**:

1. **Planeje antes de codar** (estilo `shape`): defina ação primária, todos os estados (default/vazio/loading/erro/sucesso/edge), interação e conteúdo (copy do glossário). Em mudança de direção relevante, confirme com o usuário antes de implementar.
2. **Implemente** preservando `app/`/`shared/` e generalizando `features/`.
3. **Feche contra a Definição de Pronto** do `DESIGN.md` e rode `pnpm check`.

Trabalhe em incrementos pequenos (idealmente uma fase = um PR), mantendo o app funcional a cada etapa.

## Convenções de clean code

- **TypeScript estrito.** Sem `any`, sem `@ts-ignore`, sem `eslint-disable` sem justificativa. Tipos derivados de `zod` onde já existe schema.
- **Domínio dirige a estrutura.** Lógica de domínio em `features/*/data` e stores; componentes apresentam, não decidem regra de negócio.
- **Imports por alias** (`@/shared/...`, `@/features/...`), nunca caminhos relativos profundos. Ordenação por Prettier sort-imports já configurada.
- **Funções pequenas e nomeadas pelo domínio** (vocabulário do glossário). Nada de `data2`, `handleClick3`.
- **Sem código morto.** `knip` deve passar. Ao generalizar, remova o que ficou órfão (não comente "para depois").
- **Imutabilidade no estado** (Zustand): atualizações puras, sem mutação direta.
- **Classifique todo desvio por causa-raiz** ao reaproveitar componentes: token faltando, implementação avulsa (trocar pelo componente compartilhado), ou desalinhamento de fluxo. Não acumule drift.
- **Formate datas/números com `Intl` pt-BR.** Nunca concatenação manual.

## Regras de design (resumo — fonte é `DESIGN.md`)

- **shadcn primeiro.** Operar pela CLI/MCP (`npx shadcn@latest search/docs/add`), nunca baixar arquivo cru do GitHub. Formulários nas primitivas `Field`/`FieldGroup` (instalar), validação `data-invalid` + `aria-invalid`.
- **Identidade por tokens, não overrides.** Tokens semânticos, nunca cor crua; `className` só para layout; `gap` não `space-y`; `size-*` quando largura=altura; sem `dark:` manual.
- **Acento verde único**, raro, só em ação/seleção/estado. Status sempre **cor + ícone + label** (nunca cor sozinha).
- **Elemento-assinatura:** a visualização da **herança** na cadeia (ver `DESIGN.md` e o protótipo). É onde mora a (pouca) ousadia; o resto é sóbrio.
- **Movimento** só de estado, 150–250 ms, ease-out, sem coreografia de page-load; `prefers-reduced-motion`.
- **Carga cognitiva baixa:** ≤4 campos por bloco; herança visível e co-locada (reduz recall).
- **Copy:** glossário canônico, botão verbo+objeto com toast espelhado, label acima do campo, **sem em-dash** (`—`/`–`) — usar hífen.

## Guardrails (o que NÃO fazer)

- Não reescrever do zero o que já funciona em `app/`/`shared/`.
- Não fazer só rebranding e parar: a Fase 1 é **generalizar o domínio**, não trocar strings.
- Não introduzir nova lib de UI/ícones (já é shadcn + lucide). Sem segundo acento de cor competindo com o verde.
- Não criar dados "Jane Doe": nomes brasileiros realistas; números mock plausíveis e rotulados.
- Não tratar herança como cópia silenciosa: ela é sempre visível, marcada e reversível.
- Não fechar tarefa com `pnpm check` falhando.

## Estado atual

Fork criado a partir do TR Fácil. Fase 0 concluída: tema Nature aplicado, identidade da aplicação limpa (placeholder "Fase Preparatória"). Pendente: Fase 1 em diante (ver `PRD.md`). Referências a FIEPE/IEL/SESI ainda presentes em `features/tr/data/*` são **dados de domínio do TR** e serão refeitas ao generalizar (Fase 1), não são identidade.
