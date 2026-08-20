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
| **Migrations** | *(vazio)* |
| **Pasta de saída** | `dist` |
| **Start** | `node server/src/index.js` |
| **Porta interna** | `4015` *(ou outra porta única não utilizada na VM)* |
| **Health-check (rota)** | `/health.json` |
| **Runtime Detectado** | `node-with-static` *(Obrigatório)* |

---

## 2. Variáveis de Produção (.env na VM)

| Variável | Valor |
|---|---|
| `PORT` | `4015` *(deve ser idêntica à Porta interna do cadastro)* |
| `NODE_ENV` | `production` |
| `PUBLIC_URL` | `https://sentinela.grupocontaturmkp.com.br` |
| `TRUST_PROXY` | `1` |
| `VITE_PUBLIC_URL` | `https://sentinela.grupocontaturmkp.com.br` |

---

## 3. Checklist Pré-Deploy e Validações

- [x] Servidor Node de produção em `server/src/index.js` escutando em `process.env.PORT`.
- [x] Script `"start": "node server/src/index.js"` no `package.json` (habilita runtime `node-with-static`).
- [x] Arquivo `public/health.json` com `{"status":"UP","app":"sentinela"}`.
- [x] Rotas `/health.json`, `/health` e `/api/health` respondendo 200 OK sem autenticação.
- [x] Multi-Tenant seguro com isolamento para Contatur São Paulo, Contatur Rio e MKP São Paulo.
