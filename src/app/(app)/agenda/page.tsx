import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderOpen,
  Stethoscope,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import {
  prioridadeLabels,
  statusColors,
  statusLabels,
  statusTratamentoColors,
  statusTratamentoLabels,
} from "@/lib/labels";
import { formatDate, formatDateShort } from "@/lib/utils";

type ItemAgenda = {
  id: string;
  protocolo: string;
  pacienteNome: string;
  status: string;
  prioridade: string;
  prazoEm: Date | null;
  concluidaEm: Date | null;
  clinic: { name: string };
  responsavel: { name: string } | null;
};

type ItemTratamentoAgenda = {
  id: string;
  descricao: string;
  status: string;
  dataProxima: Date | null;
  finalizadoEm: Date | null;
  clinic: { name: string };
  responsavel: { name: string } | null;
  reclamacao: { id: string; protocolo: string; pacienteNome: string };
};

type ColunaConfig = {
  key: string;
  title: string;
  hint: string;
  icon: typeof FolderOpen;
  header: string;
  accent: string;
  count: string;
};

const colunasReclamacao: ColunaConfig[] = [
  {
    key: "abertas",
    title: "Demandas abertas",
    hint: "Em andamento sem urgência imediata",
    icon: FolderOpen,
    header: "border-sky-200 bg-sky-50",
    accent: "bg-sky-500",
    count: "bg-sky-100 text-sky-800",
  },
  {
    key: "vence24h",
    title: "Vencem em 24 horas",
    hint: "Priorize nestas próximas horas",
    icon: Clock3,
    header: "border-amber-200 bg-amber-50",
    accent: "bg-amber-500",
    count: "bg-amber-100 text-amber-900",
  },
  {
    key: "atrasadas",
    title: "Atrasadas",
    hint: "Prazo já ultrapassado",
    icon: AlertTriangle,
    header: "border-red-200 bg-red-50",
    accent: "bg-red-500",
    count: "bg-red-100 text-red-800",
  },
  {
    key: "concluidas",
    title: "Concluídas na semana",
    hint: "Encerradas na semana vigente (seg–dom)",
    icon: CheckCircle2,
    header: "border-emerald-200 bg-emerald-50",
    accent: "bg-emerald-500",
    count: "bg-emerald-100 text-emerald-800",
  },
];

const colunasTratamento: ColunaConfig[] = [
  {
    key: "abertos",
    title: "Abertos no dia",
    hint: "Vinculados hoje, independente da data do próximo",
    icon: Stethoscope,
    header: "border-teal-200 bg-teal-50",
    accent: "bg-teal-500",
    count: "bg-teal-100 text-teal-800",
  },
  {
    key: "hoje",
    title: "Agendados hoje",
    hint: "Próximo tratamento marcado para hoje",
    icon: CalendarDays,
    header: "border-amber-200 bg-amber-50",
    accent: "bg-amber-500",
    count: "bg-amber-100 text-amber-900",
  },
  {
    key: "atrasados",
    title: "Tratamentos atrasados",
    hint: "Próximo tratamento com data já vencida",
    icon: AlertTriangle,
    header: "border-red-200 bg-red-50",
    accent: "bg-red-500",
    count: "bg-red-100 text-red-800",
  },
  {
    key: "finalizados",
    title: "Finalizados na semana",
    hint: "Concluídos na semana vigente (seg–dom)",
    icon: CheckCircle2,
    header: "border-emerald-200 bg-emerald-50",
    accent: "bg-emerald-500",
    count: "bg-emerald-100 text-emerald-800",
  },
];

function boundsDiaSaoPaulo(ref = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ref);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  const inicio = new Date(`${y}-${m}-${d}T00:00:00-03:00`);
  const fim = new Date(`${y}-${m}-${d}T23:59:59.999-03:00`);
  return { inicio, fim };
}

function boundsSemanaVigenteSaoPaulo(ref = new Date()) {
  const { inicio: inicioHoje } = boundsDiaSaoPaulo(ref);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  }).format(ref);
  const diasDesdeSegunda: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = diasDesdeSegunda[weekday] ?? 0;
  const inicio = new Date(inicioHoje.getTime() - offset * 24 * 60 * 60 * 1000);
  const fim = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  return { inicio, fim };
}

function CardReclamacao({
  item,
  destaqueData,
}: {
  item: ItemAgenda;
  destaqueData: "prazo" | "conclusao";
}) {
  return (
    <Link
      href={`/reclamacoes/${item.id}`}
      className="block cursor-pointer rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm transition hover:border-[var(--brand)] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {item.protocolo}
        </p>
        <Badge className={`shrink-0 ${statusColors[item.status]}`}>
          {statusLabels[item.status]}
        </Badge>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm text-[var(--ink)]">
        {item.pacienteNome}
      </p>
      <p className="mt-1 truncate text-xs text-[var(--muted)]">
        {item.clinic.name}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
        <span>
          {destaqueData === "conclusao" ? "Concluída" : "Prazo"}{" "}
          {formatDate(
            destaqueData === "conclusao" ? item.concluidaEm : item.prazoEm
          )}
        </span>
        <span aria-hidden>·</span>
        <span className="truncate">
          {item.responsavel?.name || "Sem responsável"}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
        {prioridadeLabels[item.prioridade]}
      </p>
    </Link>
  );
}

function CardTratamento({
  item,
  destaqueData,
}: {
  item: ItemTratamentoAgenda;
  destaqueData: "proxima" | "finalizacao";
}) {
  return (
    <Link
      href={`/tratamentos/${item.id}`}
      className="block cursor-pointer rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm transition hover:border-[var(--brand)] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {item.reclamacao.protocolo}
        </p>
        <Badge className={`shrink-0 ${statusTratamentoColors[item.status]}`}>
          {statusTratamentoLabels[item.status] || item.status}
        </Badge>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm text-[var(--ink)]">
        {item.reclamacao.pacienteNome}
      </p>
      <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
        {item.descricao}
      </p>
      <p className="mt-1 truncate text-xs text-[var(--muted)]">
        {item.clinic.name}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
        <span>
          {destaqueData === "finalizacao" ? "Finalizado" : "Próximo"}{" "}
          {destaqueData === "finalizacao"
            ? formatDate(item.finalizadoEm)
            : formatDateShort(item.dataProxima)}
        </span>
        <span aria-hidden>·</span>
        <span className="truncate">
          {item.responsavel?.name || "Sem responsável"}
        </span>
      </div>
    </Link>
  );
}

export default async function AgendaPage() {
  await requireSession();
  const agora = new Date();
  const em24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const { inicio: inicioHoje, fim: fimHoje } = boundsDiaSaoPaulo(agora);
  const { inicio: inicioSemana, fim: fimSemana } = boundsSemanaVigenteSaoPaulo(agora);

  const includeReclamacao = {
    clinic: { select: { name: true } },
    responsavel: { select: { name: true } },
  } as const;

  const includeTratamento = {
    clinic: { select: { name: true } },
    responsavel: { select: { name: true } },
    reclamacao: {
      select: { id: true, protocolo: true, pacienteNome: true },
    },
  } as const;

  const statusAbertos = [
    "ABERTA",
    "EM_ANDAMENTO",
    "AGUARDANDO_PARECER",
    "VINCULADA_TRATAMENTO",
  ] as const;

  const [
    abertas,
    vencem24h,
    atrasadas,
    concluidas,
    tratamentosAbertos,
    tratamentosHoje,
    tratamentosAtrasados,
    tratamentosFinalizados,
  ] = await Promise.all([
    prisma.reclamacao.findMany({
      where: {
        status: { in: [...statusAbertos] },
        OR: [{ prazoEm: null }, { prazoEm: { gt: em24h } }],
      },
      include: includeReclamacao,
      orderBy: { prazoEm: "asc" },
      take: 50,
    }),
    prisma.reclamacao.findMany({
      where: {
        status: { in: [...statusAbertos] },
        prazoEm: { gte: agora, lte: em24h },
      },
      include: includeReclamacao,
      orderBy: { prazoEm: "asc" },
      take: 50,
    }),
    prisma.reclamacao.findMany({
      where: {
        OR: [
          { status: "ATRASADA" },
          {
            status: { in: [...statusAbertos] },
            prazoEm: { lt: agora },
          },
        ],
      },
      include: includeReclamacao,
      orderBy: { prazoEm: "asc" },
      take: 50,
    }),
    prisma.reclamacao.findMany({
      where: {
        status: { in: ["CONCLUIDA", "ENCERRADA"] },
        concluidaEm: { gte: inicioSemana, lte: fimSemana },
      },
      include: includeReclamacao,
      orderBy: { concluidaEm: "desc" },
      take: 50,
    }),
    prisma.tratamento.findMany({
      where: {
        createdAt: { gte: inicioHoje, lte: fimHoje },
      },
      include: includeTratamento,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.tratamento.findMany({
      where: {
        status: "EM_ANDAMENTO",
        dataProxima: { gte: inicioHoje, lte: fimHoje },
      },
      include: includeTratamento,
      orderBy: { dataProxima: "asc" },
      take: 50,
    }),
    prisma.tratamento.findMany({
      where: {
        status: "EM_ANDAMENTO",
        dataProxima: { lt: inicioHoje },
      },
      include: includeTratamento,
      orderBy: { dataProxima: "asc" },
      take: 50,
    }),
    prisma.tratamento.findMany({
      where: {
        status: "CONCLUIDO",
        finalizadoEm: { gte: inicioSemana, lte: fimSemana },
      },
      include: includeTratamento,
      orderBy: { finalizadoEm: "desc" },
      take: 50,
    }),
  ]);

  const dadosReclamacao: Record<string, ItemAgenda[]> = {
    abertas,
    vence24h: vencem24h,
    atrasadas,
    concluidas,
  };

  const dadosTratamento: Record<string, ItemTratamentoAgenda[]> = {
    abertos: tratamentosAbertos,
    hoje: tratamentosHoje,
    atrasados: tratamentosAtrasados,
    finalizados: tratamentosFinalizados,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Agenda GRC
        </h1>
        <p className="text-[var(--muted)]">
          Visão em colunas das reclamações e dos tratamentos do dia
        </p>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Reclamações
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Aberto, urgente, atrasado e concluído na semana
          </p>
        </div>

        <div className="h-[min(32rem,55dvh)] overflow-x-auto pb-1">
          <div className="flex h-full min-w-max gap-4 lg:min-w-0 lg:gap-3">
            {colunasReclamacao.map((coluna) => {
              const Icon = coluna.icon;
              const items = dadosReclamacao[coluna.key] || [];
              return (
                <section
                  key={coluna.key}
                  className="flex h-full w-[min(20rem,85vw)] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:w-auto lg:min-w-0 lg:flex-1"
                >
                  <header
                    className={`shrink-0 border-b px-3 py-3 ${coluna.header}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${coluna.accent}`}
                        aria-hidden
                      />
                      <Icon
                        className="h-4 w-4 shrink-0 text-[var(--ink)]"
                        aria-hidden
                      />
                      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ink)]">
                        {coluna.title}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${coluna.count}`}
                      >
                        {items.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {coluna.hint}
                    </p>
                  </header>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                    {items.length === 0 ? (
                      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-white/60 px-3 text-center text-sm text-[var(--muted)]">
                        Nenhum item nesta coluna
                      </div>
                    ) : (
                      items.map((item) => (
                        <CardReclamacao
                          key={item.id}
                          item={item}
                          destaqueData={
                            coluna.key === "concluidas" ? "conclusao" : "prazo"
                          }
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Tratamentos
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Vinculados hoje, agendados, atrasados e finalizados na semana
          </p>
        </div>

        <div className="h-[min(32rem,55dvh)] overflow-x-auto pb-1">
          <div className="flex h-full min-w-max gap-4 lg:min-w-0 lg:gap-3">
            {colunasTratamento.map((coluna) => {
              const Icon = coluna.icon;
              const items = dadosTratamento[coluna.key] || [];
              return (
                <section
                  key={coluna.key}
                  className="flex h-full w-[min(20rem,85vw)] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:w-auto lg:min-w-0 lg:flex-1"
                >
                  <header
                    className={`shrink-0 border-b px-3 py-3 ${coluna.header}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${coluna.accent}`}
                        aria-hidden
                      />
                      <Icon
                        className="h-4 w-4 shrink-0 text-[var(--ink)]"
                        aria-hidden
                      />
                      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ink)]">
                        {coluna.title}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${coluna.count}`}
                      >
                        {items.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {coluna.hint}
                    </p>
                  </header>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                    {items.length === 0 ? (
                      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-white/60 px-3 text-center text-sm text-[var(--muted)]">
                        Nenhum item nesta coluna
                      </div>
                    ) : (
                      items.map((item) => (
                        <CardTratamento
                          key={item.id}
                          item={item}
                          destaqueData={
                            coluna.key === "finalizados"
                              ? "finalizacao"
                              : "proxima"
                          }
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
