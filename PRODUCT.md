# PRODUCT.md

> Fonte de verdade do produto: o que é, para quem, e qual problema resolve. Acompanha o `DESIGN.md` (tokens, regras visuais, glossário e Definição de Pronto). Derivado do plano em `PLANO-REAPROVEITAMENTO.md`.

## Nome

**Nome do produto: a definir** (placeholder de trabalho: *Fase Preparatória*). A pasta `FASE-PREPARATORIA.V0` e qualquer string "TR Fácil / Sistema FIEPE" herdada da base devem ser substituídas na Fase 0.

## Register

**Produto** (o design *serve* a tarefa). Não é marca/landing. A meta é **familiaridade conquistada**: um usuário fluente em ferramentas da categoria (Linear, Notion, Stripe) deve sentar e confiar na interface, com a ferramenta sumindo na tarefa. Modo de falha a evitar: estranheza sem propósito.

## Problema e propósito

Plataforma da **fase preparatória da contratação pública** (Lei 14.133), cobrindo a cadeia documental **DFD → ETP → TR** com construtor de modelos, herança controlada de informações e apoio de IA. Substitui o preenchimento manual, desconectado e propenso a retrabalho desses documentos por um fluxo encadeado, em que cada documento herda o que o anterior já consolidou.

## A cadeia documental

A ordem é uma **dependência real** do processo (por isso a numeração 1·2·3 é legítima na interface):

1. **DFD — Documento de Formalização da Demanda.** Documento inaugural; formaliza a necessidade. Campos comuns: objeto, justificativa, unidade requisitante, responsável, data prevista, vínculo ao PCA.
2. **ETP — Estudo Técnico Preliminar.** Analisa problema, alternativas e viabilidade técnica/econômica. Campos: problema, requisitos, quantidades, levantamento de mercado (apoio de IA via PNCP e repositório próprio), valor estimado, solução, conclusão.
3. **TR — Termo de Referência.** Detalha a solução escolhida. Campos: objeto (herdado), requisitos, execução, medição, itens (tabela com sugestão de IA), preço de referência, modalidade.

**Herança controlada:** informações comuns (objeto, justificativa, unidade, responsável, vínculo ao PCA) fluem DFD → ETP → TR, pré-preenchendo o documento seguinte com indicação de "herdado / ajustado". A herança não é só conveniência: ela elimina duas violações clássicas de carga cognitiva (*Memory Bridge* e *Context Switch*) e é o **elemento-assinatura** do produto (ver `DESIGN.md`).

## Dois papéis

- **Sustentação** — cria, edita e publica os **modelos** (templates) de DFD, ETP e TR. Define estrutura de campos, obrigatoriedade e regras.
- **Requisitante (operacional)** — usa os modelos já publicados para gerar os **documentos**, com herança e apoio de IA.

No v0 (sem autenticação), o papel é um **contexto de UI** que alterna menu e permissões; não há login.

## Personas

Derivadas para guiar `shape` e `critique`. Escolher 2–3 por avaliação.

### Ana — Requisitante operacional (persona primária)
Servidora que precisa produzir DFD/ETP/TR corretos sem ser especialista em licitação. Foco e pressa; quer concluir a cadeia com confiança de que nada ficou faltando.
- **Objetivos:** preencher rápido, reaproveitar o que já existe, não errar obrigatoriedade.
- **Red flags:** ter que relembrar o que escreveu no DFD para preencher o ETP; não saber em que ponto da cadeia está; validação que só aparece no fim.

### Equipe de Sustentação — Construtora de modelos
Time técnico/administrativo que modela os formulários. Quer poder e precisão na definição de campos, seções e regras, e publicar com segurança.
- **Objetivos:** montar/ajustar modelos sem código, versionar, publicar.
- **Red flags:** construtor que não reflete fielmente como o documento final ficará; mudança de modelo que quebra documentos existentes sem aviso.

### Sam — Usuário dependente de acessibilidade (obrigatório em produto público)
Usa leitor de tela e/ou navegação por teclado; pode ter baixa visão. Em órgão público, atender Sam é requisito, não diferencial.
- **Objetivos:** completar qualquer tarefa por teclado, com rótulos e status anunciados.
- **Red flags:** foco invisível, campos sem label, cor como único indicador de status, alvos de toque < 44px.

## Superfícies (features) do v0

- **Dashboard** — visão da cadeia (DFDs/ETPs/TRs por status, por unidade, taxa de conclusão).
- **Listagem** — documentos com filtro por tipo (DFD/ETP/TR), status e vínculo de cadeia.
- **Construtor de modelos** (perfil Sustentação) — CRUD de modelos: campos, seções, obrigatoriedade, publicação.
- **Wizard de documento** (perfil Requisitante) — geração de DFD/ETP/TR a partir do modelo, com herança e assistente de IA.
- **View do documento** — visualização consolidada + exportação/impressão (DFD/ETP/TR como artefato oficial).

## Escopo do v0 (decisões confirmadas)

- **Fork novo** preservando o TR Fácil original.
- **Construtor de modelos completo** já no v0 (modelos como dado editável/publicável).
- **Frontend-first com dados mockados e sem autenticação**; papel como contexto de UI.
- **IA mockada**, com a interface pronta para integração futura (PNCP / repositório).

## Anti-objetivos

- Não é uma landing/marca; nada de ousadia visual decorativa.
- Não recriar identidade do TR Fácil nem herdar "TR Fácil / FIEPE".
- Não inventar afordância nova para tarefa padrão (formulário, tabela, modal) — familiaridade vence surpresa.
- Não tratar herança como cópia silenciosa; ela é sempre **visível e rastreável**.

## Status e próximos passos

- Fork criado. Faltam: Fase 0 (identidade/tokens, limpar referências TR/FIEPE), Fase 1 (generalizar domínio → `DocType`), Fase 2 (construtor), Fase 3 (3 documentos + herança), Fase 4 (dashboard/listagem/view multi-tipo), Fase 5 (IA + papéis).
- Antes de cada feature: rodar `shape` (brief). Ao fechar: `critique` + `audit` + `polish` contra a Definição de Pronto do `DESIGN.md`.
