# SISTEMA GRC · Grupo Sorria

Gestão de reclamações para franquias de clínicas odontológicas.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + componentes próprios (padrão shadcn)
- PostgreSQL + Prisma
- Better Auth (papéis: Admin, SAC, Coordenação, Gerência, Dentista, Auditoria, Diretoria)
- Resend (e-mails de SLA)
- Recharts (relatórios)
- Vercel Cron (`/api/cron/sla`) + QR Code NPS

## Pré-requisitos

- Node.js 20+
- Docker Desktop (Postgres local) **ou** Postgres/Neon na nuvem

## Setup local

```bash
# 1. Subir Postgres (porta 5433 no host)
docker compose up -d

# 2. Instalar dependências
npm install

# 3. Configurar .env (já existe um exemplo local)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/sistema_grc?schema=public

# 4. Criar schema e dados iniciais
npm run db:setup

# 5. Rodar
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

**Login padrão:** `admin@gmail.com` / `admin`

## Deploy (Vercel + Neon)

1. Crie um banco Postgres no Neon e copie a `DATABASE_URL`
2. Faça deploy do projeto na Vercel
3. Configure as variáveis de `.env.example` no painel da Vercel
4. Rode `npx prisma migrate deploy` (ou `db push`) no banco de produção
5. Rode o seed se desejar usuários iniciais
6. O cron horário chama `/api/cron/sla` com header `Authorization: Bearer $CRON_SECRET`

## Módulos

- Home GRC / CRC
- Gestão de reclamações (protocolos)
- Agenda GRC
- Tratamentos vinculados
- Relatórios executivos
- Gestão de NPS (QR Code)
- Admin: usuários, clínicas e esteira

Integrações automáticas de WhatsApp/Instagram/Google/Reclame Aqui ficam fora do MVP — abertura manual pelo SAC.
