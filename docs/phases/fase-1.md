# Fase 1 — Generalizar o domínio (TR → DFD · ETP · TR)

> Checklist acionável para o Claude Code. Objetivo da fase: transformar o domínio específico de "TR" num motor genérico por **tipo de documento** (`DocType`), com herança funcional — espelhando o protótipo `prototypes/fase1-cadeia-heranca.html`. Não é rebranding: é generalização de domínio. Ler antes: `CLAUDE.md`, `PRD.md` (§4 e §7), `DESIGN.md`.

## Objetivo e resultado esperado

Ao final, o app gera **DFD, ETP e TR pelo mesmo motor**, com os campos comuns fluindo de um documento para o seguinte (herança visível e ajustável) e a dependência da cadeia respeitada (não dá para iniciar o ETP sem DFD concluído, nem o TR sem ETP). Comportamento de referência: o protótipo.

## Pré-requisitos

- [ ] Ler `CLAUDE.md` (enquadramento, guardrails, convenções) e `PRD.md` §4 (conceitos) e §7 (faseamento).
- [ ] Rodar `pnpm install` e `pnpm dev`; confirmar que o app sobe com o tema Nature.
- [ ] Abrir o protótipo `prototypes/fase1-cadeia-heranca.html` no navegador e usá-lo como espelho de comportamento.

## Tickets

### 1. Modelar o `DocType` e os tipos genéricos
- [ ] Criar o tipo `DocType = 'dfd' | 'etp' | 'tr'` como dimensão de primeira classe.
- [ ] Renomear os tipos do domínio para nomes neutros (sem "TR"): `TRTemplateDefinition` → `ModelDefinition`, `TRFieldDefinition` → `FieldDefinition`, `TRSectionDefinition` → `SectionDefinition`, `TRDocumentData` → `DocumentData`.
- [ ] Marcar quais campos são **comuns/herdáveis** (objeto, justificativa, unidade requisitante, responsável, vínculo ao PCA; e a solução do ETP para o TR).

### 2. Reorganizar a pasta do domínio
- [ ] Renomear `src/features/tr/` → `src/features/documents/` e atualizar imports/aliases (`@/features/...`).
- [ ] Manter `src/app/` e `src/shared/` **intactos** (são genéricos; não reescrever).
- [ ] Atualizar as rotas em `src/routes/` para o vocabulário novo (ex.: `/novo-tr` → `/novo-documento` com o `DocType` como parâmetro).

### 3. Definir os três modelos padrão
- [ ] Criar os modelos DFD, ETP e TR com os campos do `PRD.md` §5.3, reaproveitando o motor de `templates.ts`.
- [ ] Remover/neutralizar os dados de domínio do TR antigo (instituições FIEPE/IEL/SESI, receitas específicas) — substituir por dados mock genéricos e plausíveis (nomes brasileiros realistas, sem "Jane Doe").

### 4. Implementar a herança
- [ ] Criar `inheritCommonFields(source, targetModel)`: ao gerar o documento seguinte, pré-preenche os campos comuns a partir do documento-pai.
- [ ] Marcar cada campo como `herdado` ou `ajustado` (quando editado), com ação para **restaurar o valor herdado**.
- [ ] Adicionar `parentId` ao documento (liga ETP→DFD e TR→ETP).
- [ ] Regras de dependência: bloquear iniciar ETP sem DFD concluído; TR sem ETP concluído.

### 5. Generalizar wizard, view e store
- [ ] O wizard (`features/documents/wizard`) recebe `docType` + modelo e renderiza dinamicamente (já faz isso para o TR; parametrizar).
- [ ] A store Zustand passa a operar por `DocType`.
- [ ] A view e o export do documento passam a ser parametrizados por tipo (sem hardcode "Termo de Referência").

### 6. Aplicar as regras de design da fase
- [ ] Formulários nas primitivas `Field`/`FieldGroup` do shadcn (instalar via `npx shadcn@latest add`); label acima do campo; ≤4 campos por bloco.
- [ ] Herança usando a **assinatura** do `DESIGN.md` (lavagem de acento verde 4–8% + ícone de elo; nunca borda-faixa lateral).
- [ ] Status sempre com cor + ícone + label; copy do **glossário canônico** (Modelo, Documento, Herdado, Concluir, etc.); sem em-dash.

## Definição de Pronto da fase

Além da checklist da Definição de Pronto do `DESIGN.md`, esta fase só fecha quando:

- [ ] É possível percorrer **DFD → ETP → TR** gerando os três pelo mesmo motor.
- [ ] Os campos comuns aparecem **herdados** no documento seguinte e podem ser **ajustados** e **restaurados**.
- [ ] A dependência da cadeia é respeitada (bloqueio de etapa).
- [ ] Não há mais identificadores "TR" como tipo único no código (o domínio é genérico por `DocType`).
- [ ] `pnpm check` passa (lint + format + knip + typecheck), sem código órfão.
- [ ] Avaliação `critique` (carga cognitiva, personas Ana/Sustentação) + `audit` na faixa Excelente.

## Fora do escopo desta fase

- Construtor de modelos editável pela UI (é a Fase 2).
- Persistência real / backend (segue mockado).
- Integração real de IA (segue mockada).
- Seletor de papéis Sustentação/Requisitante (é a Fase 5).

## Sugestão de divisão em PRs

1. PR-1: `DocType` + renomeação de tipos (tickets 1).
2. PR-2: reorganização de pasta e rotas (ticket 2).
3. PR-3: modelos padrão + dados mock genéricos (ticket 3).
4. PR-4: herança + dependência da cadeia (ticket 4).
5. PR-5: generalizar wizard/view/store + regras de design (tickets 5 e 6).

Cada PR mantém o app funcional e passa por `pnpm check` antes de fechar.
