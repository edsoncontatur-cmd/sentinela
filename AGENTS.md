# AGENTS.md — Identidade visual Contatur (FinanceHub)

Instruções para **qualquer** assistente de IA (Cursor, Copilot, ChatGPT, Claude, etc.) que trabalhe neste repositório ou em apps derivados dele.

## Regra central

Este projeto define a **identidade visual única** dos aplicativos Contatur: mesma paleta, fontes, espaçamentos, raios, sombras, transições e casca (sidebar navy + topbar + toggle claro/escuro). **Não criar identidade paralela.** Ao gerar telas/componentes novos, seguir este padrão sem exceção.

## Stack

React 18 + TypeScript + Vite + Tailwind v3 + shadcn/ui + Recharts. Tema por variáveis CSS HSL com classe `.dark` no `<html>`.

## Ativos que carregam a identidade (não reescrever)

- `src/index.css` — tokens HSL claro/escuro + sistema *elevate*.
- `tailwind.config.ts` — cores via `hsl(var(--…))`, raios, fontes.
- `src/components/ui/*` — primitivos shadcn/ui (usar estes, não recriar).
- `src/lib/utils.ts` (`cn()`), `src/hooks/*`.
- Fontes (Inter + Libre Baskerville + JetBrains Mono) em `index.html`.
- Casca: `src/App.tsx` (AppShell) + `src/components/app-sidebar.tsx` + `src/components/theme-toggle.tsx`.

## Âncoras de marca (não alterar)

- `--primary: 221 83% 53%` (azul) · `--accent: 199 89% 48%` (ciano) · `--sidebar: 222 64% 33%` (navy).
- `--radius: .75rem` · `--font-sans: 'Inter'`.

## Ao desenvolver

- Cores **sempre** via tokens (`bg-background`, `text-muted-foreground`, `hsl(var(--…))`); **nunca** hex de marca fixo.
- Tema **só claro/escuro** (toggle no topbar); nunca recriar seletor de múltiplos temas.
- Componentes: usar os primitivos de `src/components/ui/*` (Button, Card, Badge, Tabs, Select, Dialog, Sheet, Sidebar…).
- **Gráficos (Recharts):** paleta financeira (azuis/teal) + status semânticos — verde=ok/aprovado, âmbar=alerta/pendente, vermelho=erro/bloqueado. Usar literais `hsl()` em `fill`/`stroke` (atributo SVG não resolve `var()`).
- Texto em **PT-BR** com acentuação; telas dentro da casca; responsivo (desktop + ~360px).

## Antes de concluir

- [ ] Usou tokens e primitivos do template (sem paleta/identidade paralela).
- [ ] Telas dentro do AppShell; tema claro/escuro funcionando.
- [ ] `npm run build` e `npm run check` sem erro.

## Comandos

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção (vite)
npm run check    # checagem de tipos (tsc --noEmit)
```
