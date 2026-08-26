import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { prioridadeLabels, statusColors, statusLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock3, FolderOpen } from "lucide-react";

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

const colunasConfig = [
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
    hint: "Encerradas nos últimos 7 dias",
    icon: CheckCircle2,
    header: "border-emerald-200 bg-emerald-50",
    accent: "bg-emerald-500",
    count: "bg-emerald-100 text-emerald-800",
  },
] as const;

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

export default async function AgendaPage() {
  await requireSession();
  const agora = new Date();
  const em24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const semana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const include = {
    clinic: { select: { name: true } },
    responsavel: { select: { name: true } },
  } as const;

  const statusAbertos = [
    "ABERTA",
    "EM_ANDAMENTO",
    "AGUARDANDO_PARECER",
    "VINCULADA_TRATAMENTO",
  ] as const;

  const [abertas, vencem24h, atrasadas, concluidas] = await Promise.all([
    prisma.reclamacao.findMany({
      where: {
        status: { in: [...statusAbertos] },
        OR: [{ prazoEm: null }, { prazoEm: { gt: em24h } }],
      },
      include,
      orderBy: { prazoEm: "asc" },
      take: 50,
    }),
    prisma.reclamacao.findMany({
      where: {
        status: { in: [...statusAbertos] },
        prazoEm: { gte: agora, lte: em24h },
      },
      include,
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
      include,
      orderBy: { prazoEm: "asc" },
      take: 50,
    }),
    prisma.reclamacao.findMany({
      where: {
        status: { in: ["CONCLUIDA", "ENCERRADA"] },
        concluidaEm: { gte: semana },
      },
      include,
      orderBy: { concluidaEm: "desc" },
      take: 50,
    }),
  ]);

  const dados: Record<(typeof colunasConfig)[number]["key"], ItemAgenda[]> = {
    abertas,
    vence24h: vencem24h,
    atrasadas,
    concluidas,
  };

  return (
    <div className="flex h-[calc(100dvh-11rem)] flex-col gap-4 md:h-[calc(100dvh-12rem)]">
      <div className="shrink-0">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Agenda GRC
        </h1>
        <p className="text-[var(--muted)]">
          Visão em colunas do que está aberto, urgente, atrasado e concluído
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto pb-1">
        <div className="flex h-full min-w-max gap-4 lg:min-w-0 lg:gap-3">
          {colunasConfig.map((coluna) => {
            const Icon = coluna.icon;
            const items = dados[coluna.key];
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
                    <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ink)]">
                      {coluna.title}
                    </h2>
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
    </div>
  );
}
