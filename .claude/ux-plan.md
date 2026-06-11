# Plano de UX — trfacil-design (após alinhamento Maia/Figtree)

> **Estado atual**: tema do preset `b1G2BxCJU` (Maia + Figtree) aplicado. Onda 1 de melhorias UX entregue. Próximo: Onda 2 estrutural com foco em consistência visual e charts.

## Baseline visual atual

- **Tema Maia** ativo: primary `oklch(0.488 0.243 264.376)` (azul vivo), sidebar quase branca, cards limpos sem gradientes pesados, raios escalados 0.6× → 2.6×.
- **Tipografia**: Figtree (heading + body) via `@fontsource-variable/figtree`.
- **Charts (recharts)**: bars renderizam, fonte certa, cor primary aplicada. **Pendência**: pie chart com `ResponsiveContainer` mede superfície como 14×14 em alguns mounts (compat React 19 + recharts) — render visível mas em tamanho mínimo.
- **Primitivos shadcn**: 24 + `breadcrumb` + `avatar` + `chart` instalados em `src/shared/ui/`.
- **Aliases `components.json`** corrigidos para `@/shared/*`.
- **MCP shadcn** configurado em `.mcp.json` (puxa registry após restart).

## Skills disponíveis e como usar

| Skill | Eixo |
|-------|------|
| `design:design-critique` | Crítica estruturada por tela |
| `design:accessibility-review` | WCAG AA |
| `design:ux-copy` | Microcopy, empty states, erros |
| `design:design-system` | Consistência de tokens |
| `design:design-handoff` | Specs após decisões |
| `web-design-guidelines` (vercel) | Diretrizes modernas — referência transversal |
| `make-interfaces-feel-better` (jakubkrehel) | Polish visual fino |
| `oklch-skill` (jakubkrehel) | Trabalhar com a paleta OKLCH da Maia |
| `emil-design-eng` (emilkowalski) | Design engineering |
| MCP shadcn | Catálogo de blocks/components |

> Skills novas precisam de restart da sessão pra ativar.

## Onda 1 — entregue ✅

| # | Commit | O que mudou |
|---|--------|-------------|
| 6.1 | `41e96f8` | Breadcrumb global no Header (todas as rotas) |
| 6.4 | `d8d2220` | Tooltip com Ctrl+B no SidebarTrigger |
| 2.1 | `582ec3d` | Sort indicator + menu traduzido (Crescente/Decrescente/Ocultar) |
| 1.4 | `7ae8aa5` | `aria-label` + tabela sr-only nos charts |
| 1.3 | `84aab65` | Tooltip em truncate na tabela de recentes |
| 3.2 | `300f445` | Auto-scroll respeitando `prefers-reduced-motion` |
| 3.7 | `49bc40f` | Breadcrumb com nome da etapa do wizard |
| 4.1 | `8ad30df` | Alert de modo read-only no `/tr/$trId` |
| 5.4 | `fe658dc` | "Open to review" → "Revisar TR" + tooltip |
| stepper | `0582378` | `whitespace-normal` no stepper |

## Onda 1.5 — alinhamento Maia ✅

| # | Commit | O que mudou |
|---|--------|-------------|
| Theme | `aaf5b3e` | Maia preset aplicado (theme.css + Figtree + radius scale) |
| Primitivos | `c0c8153` | `chart` + `avatar` instalados; aliases corrigidos |
| Chart fix | `cd820df` | `figure` → `div role=img` (compat ResponsiveContainer) |

## Onda 2 — estrutural (próxima)

| # | Item | Solução shadcn | Severidade |
|---|------|----------------|------------|
| 2.A | **Pie chart com superfície 14×14** (mount race) | Migrar `tr-status-chart` e `tr-units-chart` para o `ChartContainer` shadcn (já instalado em `src/shared/ui/chart.tsx`) que tem fallback de dimensão correto | P0 |
| 2.B | **`EmptyState` reusável** | Criar componente em `src/shared/components/empty-state.tsx` com `Icon + Title + Description + Action` slots | P1 |
| 2.C | **Skeletons consistentes** | Usar `Skeleton` shadcn em KPI cards, tabelas e document view durante load | P1 |
| 2.D | **Autosave no wizard** | `useEffect` com debounce 800ms → `saveDraft()` + badge "Salvo às HH:mm" no header sticky bottom | P1 |
| 2.E | **`LotMatrix` responsivo** | Substituir tabela 7-col por componente híbrido: tabela em ≥lg, cards empilhados em <md | P1 |
| 2.F | **TOC + sticky sidebar** no `/tr/$trId` | `aside sticky top-20` + `IntersectionObserver` pra TOC; mobile usa `Sheet` shadcn | P1 |
| 2.G | **Avatar do usuário** no sidebar header | Usar `Avatar` shadcn recém-instalado + `DropdownMenu` com Sair/Tema | P1 |
| 2.H | **Filtros conectados** no `/aprovacoes` | `ToggleGroup` shadcn por status (já listado pra instalar) + estado em URL params | P1 |
| 2.I | **`prefers-reduced-motion` global** | `@media (prefers-reduced-motion: reduce)` em transições da sidebar e do scroll-to-error já feito | P1 |
| 2.J | **`Chart` colors via theme** | Trocar hex hardcoded em `app.ts` por `var(--chart-1..5)` (Maia palette) | P2 |
| 2.K | **Hero do dashboard mais sóbrio** | Reduzir gradient/padding do hero do `/dashboard` pra casar com a sobriedade da Maia | P2 |

**Componentes shadcn a instalar pra Onda 2**: `toggle-group`, `progress`, `dropdown-menu` (já existe), e usar o `ChartContainer` que já está em `src/shared/ui/chart.tsx`.

## Onda 3 — polimento

- **Audit por skill** em cada tela após Onda 2:
  - `design:design-critique` no `/dashboard` (validar nova hierarquia)
  - `design:accessibility-review` em todo o shell
  - `design:ux-copy` revisão final de empty states, erros, confirmações
  - `make-interfaces-feel-better` pra detalhes finos de animação e feedback tátil
- Diff visual no `AlertDialog` de troca de modelo (wizard)
- Menu de ações secundárias (copiar link, exportar) no `/tr/$trId`
- Transição suave do header shadow

## Riscos abertos

- **Pie chart 14×14**: bloqueio para Onda 2.A. Hipótese: `ResponsiveContainer` + React 19 + Card parent. Mitigação confirmada: trocar pelo `ChartContainer` que usa `aspect-video` por padrão.
- **Skills novas não ativas**: precisam restart de sessão antes da Onda 2 começar pra aproveitar o catálogo do MCP shadcn.

## Decisões registradas

- **Projeto**: `trfacil-design` (não monorepo, não migrar pra TanStack Start)
- **Tema fonte**: Maia (`b1G2BxCJU`)
- **Lockfile**: pnpm (npm `package-lock.json` agora no `.gitignore`)
