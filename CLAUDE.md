# Sentinela (antigo — ARQUIVADO)

> **ARQUIVADO em 05/10/2026 (incorporado ao novo Sentinela, pasta `Monitor`).** Este app era uma demonstração: a tela
> rodava só no navegador com dados inventados e "IA" por palavras-chave; não lia caixa nenhuma. A função (governança das
> caixas de e-mail e detecção de reclamações de clientes) foi refeita com leitura real do Microsoft 365 na área **E-mail**
> do Sentinela (`Sistemas\Monitor`, ex-DeskGuard). Banco sem dados; cópia em
> `C:\Apps\_arquivo\sentinela\sentinela-banco-2026-10-05.dump` (guardar até 04/11/2026). Falta o Edson remover o app pelo
> botão "Remover da VM" do Publicador — isso libera o endereço `sentinela.` para o app novo. Não desenvolver aqui.
> Plano: `Sistemas/PLANO-FUSAO-DESKGUARD-SENTINELA.md`.

Monitoramento inteligente de e-mails e gestão de reclamações com IA.

**Pasta:** `Sistemas\Emails`
**Repositório:** `edsoncontatur-cmd/sentinela`
**Stack:** React 18 · Express 5 · Prisma · PostgreSQL

## Comandos

```bash
npm run dev
npm run build
npm start
```

## Publicação

Publicado pelo **Publicador** na VM Azure (`*.grupocontaturmkp.com.br`).
Detalhes deste app: `PUBLICACAO-AZURE.md`.
Fluxo: `publicador init --create` → `publicador deploy`.

## Contexto do portfólio

Um dos 23 sistemas do Grupo Contatur. Mapa completo em
`Sistemas\INVENTARIO-APPS.md`; contrato de integração entre apps em
`Documentos\API-CONTATUR-V1.md`.

## Instruções detalhadas

@AGENTS.md
