# Publicação no Console Publicador Contatur (Azure / IIS)

## 1. Dados do Cadastro no Console Publicador

| Campo | Valor |
|---|---|
| **Nome** | `Sentinela` (ou `Contatur Sentinela`) |
| **Slug / Subdomínio** | `sentinela` |
| **Origem** | `Git` |
| **Repositório Git** | `https://github.com/edsoncontatur-cmd/sentinela.git` |
| **Branch** | `main` |
| **Build** | `npm run build` |
| **Instalação** | `npm install` |
| **Migrations** | `npx prisma migrate deploy` |
| **Pasta de saída** | `dist` |
| **Start** | `node server/src/index.js` |
| **Porta interna** | `4016` *(ou outra porta única livre na VM)* |
| **Health-check (rota)** | `/health.json` |
| **Runtime Detectado** | `node-with-static` *(Obrigatório)* |

---

## 2. Variáveis de Produção (.env na VM)

| Variável | Valor | Obrigatória |
|---|---|---|
| `PORT` | `4016` *(deve ser idêntica à Porta interna do cadastro)* | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `PUBLIC_URL` | `https://sentinela.grupocontaturmkp.com.br` | ✅ |
| `TRUST_PROXY` | `1` | ✅ |
| `VITE_PUBLIC_URL` | `https://sentinela.grupocontaturmkp.com.br` | ✅ |
| `SENTINELA_API_TOKEN` | token longo aleatório (64 hex) — protege toda a API `/api/*`; sem ele a API responde 503 em produção (decisão 2026-09-06) | ✅ |
| `DATABASE_URL` | `postgresql://usuario:senha@localhost:5432/sentinela?schema=public` | ✅ |

---

## 3. Checklist Pré-Deploy e Validações

- [x] Schema Prisma PostgreSQL multi-tenant em `prisma/schema.prisma`.
- [x] Servidor Node/Express em `server/src/index.js` com rotas `/api/*` e health-check em `/health.json` e `/api/health`.
- [x] Script `"start": "node server/src/index.js"` no `package.json` (runtime `node-with-static`).
- [x] Arquivo `public/health.json` com `{"status":"UP","app":"sentinela"}`.
- [x] Script de Seed corporativo em `server/src/seed.js` para popular os 3 escritórios (Contatur SP, Contatur Rio e MKP SP).
