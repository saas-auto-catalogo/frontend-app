# SaaS Auto Catálogo — Frontend App

[![CI](https://github.com/saas-auto-catalogo/frontend-app/actions/workflows/ci.yml/badge.svg)](https://github.com/saas-auto-catalogo/frontend-app/actions/workflows/ci.yml)

Painel web do lojista (SPA): dashboard com métricas reais, inventário, catálogo Meta, pendências de catálogo, timeline de atividades e XML Mapper.

Design System **Auto Clean Pro** (light mode), inspirado em Webmotors, Localiza Seminovos e Saga.

**Wiki:** [frontend-app](https://github.com/saas-auto-catalogo/.github/blob/main/docs/wiki/frontend-app.md) · [Roadmap](https://github.com/saas-auto-catalogo/.github/blob/main/docs/wiki/roadmap.md)

---

## Stack

- React 18 + TypeScript 5.7
- Vite 6 + React Router 7
- Tailwind CSS 3.4 + Lucide Icons

---

## Módulos

| Módulo | Status |
|--------|--------|
| Auth (login, register, forgot/reset password) | Implementado |
| Dashboard (MetricCards, stats) | API real |
| Inventário (`InventoryManager`) | API real |
| Meta (`MetaConnectionCard`) | API real |
| Pendências (`PendingIssuesTable`) | API real |
| Atividades (`ActivityTimeline`) | API real |
| XML Mapper (`XmlMapperStudio`) | Parcial (wizard local) |
| Settings | Placeholder — [épico #19](https://github.com/saas-auto-catalogo/frontend-app/issues/19) |
| Onboarding | Pendente — [épico #20](https://github.com/saas-auto-catalogo/frontend-app/issues/20) |
| Audit Logs View | Pendente — [#27](https://github.com/saas-auto-catalogo/frontend-app/issues/27) |

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/login`, `/register` | Autenticação |
| `/forgot-password`, `/reset-password` | Recuperação de senha |
| `/` | Dashboard (tabs via sidebar) |

---

## Execução local

### Pré-requisitos

- `backend-api` rodando em `http://localhost:3333`
- Node.js >= 20

### Setup

```bash
npm install

# Copie o template de ambiente (ou crie .env manualmente com as mesmas variáveis)
cp .env.example .env

npm run dev        # http://localhost:3000
npm run typecheck
npm run build
```

Variáveis em `.env.example`:

- `VITE_API_URL` — URL base da API (default: `http://localhost:3333/api/v1`)
- `VITE_API_TIMEOUT` — timeout em ms (default: `15000`)
- `VITE_ENABLE_MOCK_FALLBACK=true` — opt-in: exibe veículos demo quando a API está indisponível (desligado por default)

### Fluxo comercial (register-first)

1. `/register` → cadastro com workspace
2. `/subscribe` — seleção de plano e checkout Stripe autenticado no app
3. `/subscribe/success` — confirmação e poll de billing
4. `/onboarding` — liberado após assinatura `ACTIVE`/`TRIALING`

Query opcional: `/register?plan=PRO` pré-seleciona o plano na página de assinatura.

### Credenciais seed

- **Email:** `carlos.silva@autoelitemotors.com.br`
- **Senha:** `Teste123!`

---

## Design system

- **Canvas:** `#F8FAFC` / `#FFFFFF`
- **Primária (Webmotors):** `#DC2626`
- **Acento (Saga):** `#2563EB`
- **Sucesso (Localiza):** `#16A34A`
- **Tipografia:** Inter, Plus Jakarta Sans; JetBrains Mono para VIN/placas

---

## Serviços API

Localizados em `src/services/api/`:

- `authService` — sessão JWT + cookie refresh
- `billingService` — billing do workspace, portal Stripe e checkout autenticado
- `dashboardService` — stats, meta-catalogs, issues, activity
- `vehicleService` — listagem paginada
- `feedService` — feeds do workspace
