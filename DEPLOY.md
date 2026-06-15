# Deploy na Vercel

Aplicação **frontend-only** (Vite + React, SPA). Sem backend nem variáveis de ambiente: os dados são mock. O deploy é estático.

## Passo a passo (1 clique)

1. Acesse [vercel.com/new](https://vercel.com/new) e faça login com o GitHub.
2. **Import** o repositório `DaniloAmaralUX/bbm`.
3. A Vercel detecta o framework **Vite** automaticamente. Confirme as configurações (já são o padrão):
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build` (ou deixe o padrão `vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`
   - **Production Branch:** `main`
4. Clique em **Deploy**. Ao terminar, a Vercel mostra a URL pública (ex.: `https://bbm-xxxx.vercel.app`) — é o link para compartilhar.

A cada `git push` na `main`, a Vercel republica automaticamente.

## Já configurado no repositório

- `vercel.json` — reescreve todas as rotas para `index.html`, para que os links diretos (ex.: `/documentos/novo`, `/modelos`) funcionem ao recarregar a página (a app usa roteamento client-side com TanStack Router).
- `package.json` — script `build` = `tsc -b && vite build` (typecheck + build).
- Build validado localmente: `pnpm build` gera o `dist/` sem erros.

## Observações

- O dev tools do TanStack Router que aparece no canto só roda em desenvolvimento; em produção (build) ele não é incluído.
- O papel (Sustentação/Requisitante) e o tema são lembrados por cookie no navegador.
