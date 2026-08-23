import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  canalLabels,
  motivoLabels,
  prioridadeLabels,
  statusColors,
  statusLabels,
} from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default async function ReclamacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireSession();
  const params = await searchParams;

  const items = await prisma.reclamacao.findMany({
    where: {
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.q
        ? {
            OR: [
              { protocolo: { contains: params.q, mode: "insensitive" } },
              { pacienteNome: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      clinic: true,
      responsavel: true,
      etapa: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Gestão de reclamações
          </h1>
          <p className="text-[var(--muted)]">
            Fila de protocolos com responsável, prazo e status
          </p>
        </div>
        <Button asChild>
          <Link href="/reclamacoes/nova">Abrir protocolo</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3">
            <input
              name="q"
              placeholder="Protocolo ou paciente"
              defaultValue={params.q}
              className="h-10 rounded-md border border-[var(--border)] px-3 text-sm"
            />
            <select
              name="status"
              defaultValue={params.status || ""}
              className="h-10 rounded-md border border-[var(--border)] px-3 text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Protocolo</th>
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Clínica</th>
              <th className="px-4 py-3 font-medium">Canal</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Prazo</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="px-4 py-3">
                  <Link href={`/reclamacoes/${item.id}`} className="font-medium text-black hover:underline">
                    {item.protocolo}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">
                    {prioridadeLabels[item.prioridade]} · {motivoLabels[item.motivo]}
                  </p>
                </td>
                <td className="px-4 py-3">{item.pacienteNome}</td>
                <td className="px-4 py-3">{item.clinic.name}</td>
                <td className="px-4 py-3">{canalLabels[item.canal]}</td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[item.status]}>
                    {statusLabels[item.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatDate(item.prazoEm)}</td>
                <td className="px-4 py-3">{item.responsavel?.name || "—"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">
                  Nenhuma reclamação encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
