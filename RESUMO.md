# Resumo do SISTEMA GRC — Grupo Sorria

Documento de acompanhamento do que foi especificado, implementado e deixado de fora do MVP.

**Projeto:** gestão de reclamações (GRC / CRC) para franquias de clínicas odontológicas  
**Repositório:** `sistema-grc`  
**Status:** MVP funcional, pronto para uso local e deploy (Vercel + Postgres)

---

## 1. Contexto

O Grupo Sorria precisava de um sistema interno para centralizar a voz do cliente: protocolos de reclamação, esteira com prazos, avisos de atraso, agenda operacional, relatórios executivos e pesquisa NPS.

O trabalho passou por três etapas:

1. **Especificação funcional** a partir da demo (módulos, papéis, telas e fluxos).
2. **Recomendação de stack** alinhada a prazo curto, orçamento enxuto e ownership do código pelo cliente.
3. **Implementação do MVP** neste repositório.

Integrações automáticas de WhatsApp, Instagram, Google e Reclame Aqui ficaram **fora do MVP**. A abertura do protocolo é manual pelo SAC.

---

## 2. Stack entregue

| Camada | Tecnologia |
|--------|------------|
| App (front + API) | Next.js 16 (App Router) + TypeScript + React 19 |
| UI | Tailwind CSS 4 + componentes no padrão shadcn |
| Banco | PostgreSQL 16 |
| ORM | Prisma 6 |
| Autenticação | Better Auth (e-mail/senha + papéis) |
| E-mail de SLA | Resend |
| Jobs | Vercel Cron (`/api/cron/sla`, a cada hora) |
| Relatórios | Recharts |
| NPS / QR | página pública + lib `qrcode` |
| Ambiente local | Docker Compose (Postgres na porta **5433**) |
| Deploy previsto | Vercel + Neon (ou outro Postgres na nuvem) |

Identidade visual: sidebar verde-escuro, fundo cream, títulos em serif (Fraunces), marca `#0f7a5f`.

---

## 3. O que foi implementado

### 3.1 Autenticação e papéis

- Login em `/login` (e-mail e senha).
- Middleware protege rotas internas; públicas: login, NPS por token, auth e cron.
- Papéis: **Admin**, **SAC**, **Coordenação**, **Gerência**, **Dentista**, **Auditoria**, **Diretoria**.
- Cadastro de usuários e clínicas restrito a Admin.
- Usuário pode ser vinculado a uma clínica.

### 3.2 Home GRC / CRC (`/`)

Painel inicial com:

- protocolos abertos
- atrasados
- que vencem em 24 h
- concluídos na semana

Atalhos para fila de reclamações, abertura de protocolo, agenda e relatórios.

### 3.3 Gestão de reclamações

- Lista em `/reclamacoes` com busca (protocolo ou paciente) e filtro por status.
- Abertura manual em `/reclamacoes/nova`:
  - paciente, contato, clínica
  - canal, motivo, serviço, prioridade, descrição
  - responsável
- Protocolo gerado no formato `GRC-AAAA-NNNNNN` (ex.: `GRC-2026-000001`).
- Detalhe em `/reclamacoes/[id]`:
  - dados do protocolo
  - avançar etapa da esteira
  - atribuir responsável
  - concluir (gera pesquisa NPS)
  - encerrar com parecer final
  - histórico de ações
  - vínculo de tratamento

**Canais:** WhatsApp, Instagram, Google, Reclame Aqui, Telefone, CRC, E-mail, Outro.

**Motivos:** Atendimento, Cobrança, Qualidade do tratamento, Agendamento, Financeiro, Outro.

**Prioridades:** Baixa, Média, Alta, Urgente.

**Status:** Aberta, Em andamento, Atrasada, Aguardando parecer, Concluída, Encerrada.

### 3.4 Esteira e SLA

Etapas configuráveis pelo Admin em `/admin/esteira` (nome, ordem, prazo em horas, perfil avisado, e-mail ligado/desligado).

Esteira inicial do seed:

| Ordem | Etapa | Prazo | Perfil |
|------:|-------|------:|--------|
| 1 | Abertura SAC | 24 h | SAC |
| 2 | Coordenação | 48 h | Coordenação |
| 3 | Gerência da unidade | 48 h | Gerência |
| 4 | Auditoria | 72 h | Auditoria |
| 5 | Parecer administração | 48 h | Admin |

Fluxo de negócio:

```
Abertura → SAC → Coordenação → Gerência → Auditoria → Parecer admin → Conclusão → NPS → Encerramento
```

Quando o prazo da etapa vence:

1. o cron marca o protocolo como **Atrasada**;
2. dispara e-mail (Resend) para o perfil alvo da etapa (e Admin);
3. registra o envio em `EscalonamentoLog` para não repetir o mesmo aviso.

Sem `RESEND_API_KEY`, o e-mail é apenas logado no console (modo desenvolvimento).

### 3.5 Agenda GRC (`/agenda`)

Radar operacional em quatro blocos:

- demandas abertas
- atrasadas
- que vencem em 24 horas
- concluídas na semana

### 3.6 Tratamentos vinculados (`/tratamentos`)

Cuidados ligados a um protocolo (descrição, responsável, status). Podem ser criados no detalhe da reclamação e atualizados na listagem.

### 3.7 Relatórios (`/relatorios`)

KPIs:

- volume de reclamações
- tempo médio até conclusão (horas)
- protocolos vencidos
- no prazo vs. vencido

Gráficos de barras:

- por clínica
- por cidade/UF
- por canal
- por motivo
- por responsável

### 3.8 NPS

- Ao **concluir** um protocolo, o sistema cria uma pesquisa com token único.
- Gestão em `/nps`: quantidade, respondidas, nota média e QR Code / link.
- Página pública `/nps/[token]` (sem login): nota de 0 a 10 e comentário opcional.

### 3.9 Administração

Somente perfil Admin:

- `/admin/usuarios` — criar e editar usuários (nome, e-mail, senha, papel, clínica, ativo)
- `/admin/clinicas` — criar e editar unidades (nome, cidade, UF, ativo)
- `/admin/esteira` — etapas, prazos e acionamento de e-mail

---

## 4. Modelo de dados

Entidades principais no Prisma:

| Modelo | Função |
|--------|--------|
| `User` / `Session` / `Account` / `Verification` | Auth Better Auth + papel e clínica |
| `Clinic` | Unidade da rede |
| `EsteiraEtapa` | Etapa, prazo e perfil avisado |
| `Reclamacao` | Protocolo |
| `HistoricoReclamacao` | Auditoria de ações |
| `Tratamento` | Cuidado vinculado ao protocolo |
| `NpsResposta` | Pesquisa pós-conclusão |
| `EscalonamentoLog` | Controle de e-mails de atraso |

---

## 5. Seed e acesso inicial

`npm run db:setup` cria o schema e os dados de demonstração.

**Clínicas**

- Grupo Sorria Catalão (GO)
- Grupo Sorria Goiânia (GO)

**Usuários**

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | `admin@gmail.com` | `admin` |
| SAC | `sac@gruposorria.com.br` | `sac123` |
| Coordenação | `coordenacao@gruposorria.com.br` | `coord123` |

Há um protocolo de exemplo (`GRC-2026-000001`) para Maria Silva, unidade Catalão, canal WhatsApp.

---

## 6. Como rodar

```bash
docker compose up -d
npm install
npm run db:setup
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Variáveis em `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CRON_SECRET`.

**Deploy (Vercel + Neon):** configurar as mesmas variáveis, aplicar o schema (`prisma migrate deploy` ou `db push`), opcionalmente rodar o seed. O cron horário chama `/api/cron/sla` com `Authorization: Bearer $CRON_SECRET`.

---

## 7. Estrutura relevante do código

```
prisma/schema.prisma          modelo de dados
prisma/seed.ts                clínicas, esteira, usuários e protocolo de exemplo
src/app/actions.ts            server actions (CRUD e fluxo)
src/lib/reclamacao.ts         protocolo, esteira, SLA e e-mails
src/lib/auth.ts               Better Auth
src/middleware.ts             proteção de rotas
src/app/api/cron/sla/         job horário de atrasos
src/app/(app)/                telas autenticadas
src/app/login/                login
src/app/nps/[token]/          pesquisa pública
```

---

## 8. Fora do MVP (especificado, não implementado)

Itens da demo/especificação que **não** entram nesta entrega:

- Dental Card
- protocolos de paciente/agendamento (`PAC-AAAA-NNNNNN`)
- exportação Excel/PDF e relatório em PDF
- filtros avançados (unidade, etapa, prazo, região, datas, etc.)
- gráficos de volume mensal/semanal/diário e produtividade individual
- Kanban de tratamentos (atrasados / no dia / no prazo)
- captura automática de reclamações nos canais digitais
- notificações por WhatsApp ou push (apenas e-mail de SLA)

---

## 9. Conclusão

O MVP cobre o ciclo operacional combinado: **abrir protocolo → caminhar na esteira com prazo → avisar atraso por e-mail → concluir com NPS → acompanhar na agenda e nos relatórios**, com cadastro de usuários, clínicas e etapas.

O sistema está utilizável localmente e preparado para hospedagem na Vercel com Postgres gerenciado. Os itens da seção 8 podem ser o próximo ciclo, se o cliente quiser ir além do escopo de 30 dias.
