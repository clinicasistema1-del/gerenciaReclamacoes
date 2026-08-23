import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default async function AgendaPage() {
  await requireSession();
  const agora = new Date();
  const em24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const semana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [abertas, atrasadas, vencem24h, concluidas] = await Promise.all([
    prisma.reclamacao.findMany({
      where: { status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PARECER"] } },
      include: { clinic: true, responsavel: true },
      orderBy: { prazoEm: "asc" },
      take: 20,
    }),
    prisma.reclamacao.findMany({
      where: { status: "ATRASADA" },
      include: { clinic: true, responsavel: true },
      orderBy: { prazoEm: "asc" },
      take: 20,
    }),
    prisma.reclamacao.findMany({
      where: {
        status: { in: ["ABERTA", "EM_ANDAMENTO", "ATRASADA"] },
        prazoEm: { gte: agora, lte: em24h },
      },
      include: { clinic: true, responsavel: true },
      orderBy: { prazoEm: "asc" },
    }),
    prisma.reclamacao.findMany({
      where: {
        status: { in: ["CONCLUIDA", "ENCERRADA"] },
        concluidaEm: { gte: semana },
      },
      include: { clinic: true, responsavel: true },
      orderBy: { concluidaEm: "desc" },
      take: 20,
    }),
  ]);

  const sections = [
    { title: "Demandas abertas", items: abertas },
    { title: "Atrasadas", items: atrasadas },
    { title: "Vencem em 24 horas", items: vencem24h },
    { title: "Concluídas na semana", items: concluidas },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Agenda GRC
        </h1>
        <p className="text-[var(--muted)]">
          Radar do dia: o que é crítico e o que já avançou
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>
                {section.title}{" "}
                <span className="text-[var(--muted)]">({section.items.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.length === 0 && (
                <p className="text-sm text-[var(--muted)]">Nenhum item</p>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/reclamacoes/${item.id}`}
                  className="block rounded-lg border border-[var(--border)] p-3 hover:border-[var(--brand)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{item.protocolo}</p>
                    <Badge className={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {item.pacienteNome} · {item.clinic.name}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Prazo {formatDate(item.prazoEm)} · {item.responsavel?.name || "Sem responsável"}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
