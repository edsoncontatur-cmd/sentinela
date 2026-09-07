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
| `DATABASE_URL` | `postgresql://usuario:senha@localhost:5432/sentinela?schema=public` | ✅ |
| `SENTINELA_API_TOKEN_CONTATUR_SP` | token aleatório (64 hex) — escopo **Contatur SP**, leitura e escrita | ✅ |
| `SENTINELA_API_TOKEN_CONTATUR_RIO` | token aleatório (64 hex) — escopo **Contatur Rio**, leitura e escrita | ✅ |
| `SENTINELA_API_TOKEN_MKP_SP` | token aleatório (64 hex) — escopo **MKP SP**, leitura e escrita | ✅ |
| `SENTINELA_API_TOKEN` | token global **somente leitura** (relatórios/monitoramento consolidado). Deixe vazio se não houver consumidor | ⬜ opcional |

Gere cada token com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.1 Regras de segurança da API `/api/*` (decisão 2026-09-07)

- **Escopo vem do token, não do cliente.** Cada token de escritório resolve o
  `tenantId` no servidor; o `?tenantId=` e o cabeçalho `x-tenant-id` enviados
  pelo cliente são **ignorados** (antes, um único token global lia e gravava em
  qualquer escritório — IDOR multi-tenant).
- **Token global é somente leitura.** Responde `403` a `POST`/`PATCH`/`PUT` e
  exige `?tenantId=` explícito de um escritório conhecido (`contatur_sp`,
  `contatur_rio`, `mkp_sp`); `all` não é aceito.
- **Fail-closed.** Sem nenhum token configurado a API responde `503`. A única
  exceção é `NODE_ENV=development`; `NODE_ENV` ausente **não** abre a API.
- **CORS fail-closed.** Sem `PUBLIC_URL`, fora de desenvolvimento, nenhuma
  origem cruzada é aceita (antes voltava a `*`).
- **Seed** (`POST /api/seed`) só funciona com `NODE_ENV=development`.
- Comparação de tokens sempre por `crypto.timingSafeEqual` sobre digests
  SHA-256 de tamanho fixo.

Exemplo de chamada autenticada:

```bash
curl -H "Authorization: Bearer $SENTINELA_API_TOKEN_CONTATUR_SP" \
  https://sentinela.grupocontaturmkp.com.br/api/incidents
```

---

## 3. Checklist Pré-Deploy e Validações

- [x] Schema Prisma PostgreSQL multi-tenant em `prisma/schema.prisma`.
- [x] Servidor Node/Express em `server/src/index.js` com rotas `/api/*` e health-check em `/health.json` e `/api/health`.
- [x] Script `"start": "node server/src/index.js"` no `package.json` (runtime `node-with-static`).
- [x] Arquivo `public/health.json` com `{"status":"UP","app":"sentinela"}`.
- [x] Script de Seed corporativo em `server/src/seed.js` para popular os 3 escritórios (Contatur SP, Contatur Rio e MKP SP).
- [ ] Os três tokens por escritório gerados e gravados no `.env` da VM (a API responde `503` sem eles).
