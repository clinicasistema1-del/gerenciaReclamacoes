import Link from "next/link";
import {
  ClipboardList,
  CalendarDays,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  await requireSession();

  const [abertas, atrasadas, vencem24h, concluidasSemana] = await Promise.all([
    prisma.reclamacao.count({
      where: { status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PARECER"] } },
    }),
    prisma.reclamacao.count({ where: { status: "ATRASADA" } }),
    prisma.reclamacao.count({
      where: {
        status: { in: ["ABERTA", "EM_ANDAMENTO", "ATRASADA"] },
        prazoEm: {
          gte: new Date(),
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.reclamacao.count({
      where: {
        status: { in: ["CONCLUIDA", "ENCERRADA"] },
        concluidaEm: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const cards = [
    { label: "Abertas", value: abertas, icon: ClipboardList, tone: "text-sky-700" },
    { label: "Atrasadas", value: atrasadas, icon: AlertTriangle, tone: "text-red-700" },
    { label: "Vencem em 24h", value: vencem24h, icon: Clock3, tone: "text-amber-700" },
    {
      label: "Concluídas na semana",
      value: concluidasSemana,
      icon: CheckCircle2,
      tone: "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-[linear-gradient(135deg,#ffce00_0%,#ffe566_55%,#fff176_100%)] p-8 text-black shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-black/70">
          Home GRC / CRC
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
          Central de reclamações
        </h1>
        <p className="mt-2 max-w-2xl text-black/70">
          Protocolos, prazos e visão da rede em um só lugar — para responder mais
          rápido e com mais controle.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-black text-[var(--brand)] hover:bg-black/90">
            <Link href="/reclamacoes">Gestão de reclamações</Link>
          </Button>
          <Button asChild variant="outline" className="border-black/20 bg-white/50 text-black hover:bg-white">
            <Link href="/relatorios">Relatórios</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-[var(--muted)]">
                  {card.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.tone}`} />
              </CardHeader>
              <CardContent>
                <p className="font-[family-name:var(--font-display)] text-3xl">
                  {card.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/agenda" className="rounded-xl border border-[var(--border)] bg-white p-5 hover:border-[var(--brand)]">
          <CalendarDays className="mb-3 h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-semibold">Agenda GRC</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Radar do que precisa de ação hoje
          </p>
        </Link>
        <Link href="/reclamacoes/nova" className="rounded-xl border border-[var(--border)] bg-white p-5 hover:border-[var(--brand)]">
          <ClipboardList className="mb-3 h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-semibold">Abrir protocolo</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Registrar reclamação recebida no SAC
          </p>
        </Link>
        <Link href="/relatorios" className="rounded-xl border border-[var(--border)] bg-white p-5 hover:border-[var(--brand)]">
          <BarChart3 className="mb-3 h-5 w-5 text-[var(--brand)]" />
          <h2 className="font-semibold">Painéis executivos</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Volume, canais, clínicas e tempos
          </p>
        </Link>
      </div>
    </div>
  );
}
