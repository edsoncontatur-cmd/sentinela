# Contatur Starter — identidade visual única

Template base para **novos aplicativos** com a identidade visual Contatur (FinanceHub):
mesma paleta, fontes, espaçamentos, raios, sombras, transições e casca (sidebar navy + topbar + toggle claro/escuro).

Stack: **React 18 + TypeScript + Vite + Tailwind v3 + shadcn/ui + Recharts**.

## Como usar para um app novo

1. Copie esta pasta para o local do novo projeto e renomeie:
   ```powershell
   Copy-Item "C:\Users\edson\OneDrive - CONTATUR SERVICOS CONTABEIS LTDA\Sistemas\contatur-starter" "C:\Users\edson\OneDrive - CONTATUR SERVICOS CONTABEIS LTDA\Sistemas\meu-novo-app" -Recurse
   ```
2. Ajuste `name` em `package.json`.
3. Instale e rode:
   ```powershell
   npm install
   npm run dev
   ```
4. Comece a desenvolver em `src/pages/` e adicione itens no menu em `src/components/app-sidebar.tsx`.

## O que já vem pronto (identidade — não reescrever)

- `src/index.css` — tokens HSL claro/escuro + sistema *elevate* (idêntico ao FinanceHub).
- `tailwind.config.ts` — cores via `hsl(var(--…))`, raios, fontes.
- `src/components/ui/*` — primitivos shadcn/ui completos.
- `src/lib/utils.ts` (`cn()`), `src/hooks/use-mobile.tsx`, `use-toast.ts`.
- Fontes Inter + Libre Baskerville + JetBrains Mono em `index.html`.
- Casca: `src/App.tsx` (AppShell) + `src/components/app-sidebar.tsx` + `theme-toggle.tsx`.

## Regras de identidade (resumo)

- Cores **sempre** via tokens `hsl(var(--…))` — sem hex de marca fixo nem paleta paralela.
- Tema **só claro/escuro** (toggle no topbar); nunca recriar seletor de múltiplos temas.
- Gráficos: paleta financeira + status semânticos (verde=ok, âmbar=alerta, vermelho=erro);
  use literais `hsl()` em `fill`/`stroke` (atributo SVG não resolve `var()`).
- PT-BR com acentuação; telas dentro da casca; responsivo (desktop + ~360px).

> Fonte de verdade da identidade: `Sistemas\financehub`. A regra global do Cursor
> (`~/.cursor/rules/identidade-visual-contatur.mdc`) instrui o agente a seguir este padrão.

## Publicação Azure (apps novos com backend)

Este template é **só frontend**. Ao adicionar API + PostgreSQL para produção:

1. Clone a partir daqui e evolua para monorepo (`apps/api`, `apps/web`) como Pulse ou Marketing.
2. Use **PostgreSQL** (`DATABASE_URL`) — nunca SQLite em produção.
3. API: `PORT`, escuta em `0.0.0.0`, `TRUST_PROXY=1` atrás de IIS/App Service.
4. Crie `PUBLICACAO-AZURE.md` na raiz e registre o app em `Documentos\PUBLICACAO-AZURE-CONTATUR.md`.
5. Veja `.env.example` e o guia central `Documentos\PUBLICACAO-AZURE-CONTATUR.md`.
