import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paginacao } from "@/components/paginacao";
import { TratamentosFiltros } from "@/components/tratamentos-filtros";
import {
  statusTratamentoColors,
  statusTratamentoLabels,
} from "@/lib/labels";
import { parsePage, paginationMeta } from "@/lib/pagination";
import { formatDateShort } from "@/lib/utils";

export default async function TratamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await requireSession();
  const params = await searchParams;
  const termo = params.q?.trim() || "";
  const page = parsePage(params.page);

  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(termo
      ? {
          OR: [
            { descricao: { contains: termo, mode: "insensitive" as const } },
            {
              reclamacao: {
                protocolo: { contains: termo, mode: "insensitive" as const },
              },
            },
            {
              reclamacao: {
                pacienteNome: { contains: termo, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const total = await prisma.tratamento.count({ where });
  const meta = paginationMeta(total, page);

  const tratamentos = await prisma.tratamento.findMany({
    where,
    include: {
      clinic: true,
      reclamacao: true,
      responsavel: true,
    },
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.take,
  });

  const filterParams = { q: params.q, status: params.status };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Tratamentos vinculados
        </h1>
        <p className="text-[var(--muted)]">
          Pacientes em cuidado após reclamação
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <TratamentosFiltros q={params.q} status={params.status} />
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Protocolo</th>
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Clínica</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Próximo</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {tratamentos.map((t) => (
              <tr
                key={t.id}
                className="border-b border-[var(--border)] hover:bg-[var(--surface)]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/tratamentos/${t.id}`}
                    className="font-medium text-black hover:underline"
                  >
                    {t.reclamacao.protocolo}
                  </Link>
                  <p className="text-xs text-[var(--muted)]">{t.descricao}</p>
                </td>
                <td className="px-4 py-3">{t.reclamacao.pacienteNome}</td>
                <td className="px-4 py-3">{t.clinic.name}</td>
                <td className="px-4 py-3">
                  <Badge className={statusTratamentoColors[t.status]}>
                    {statusTratamentoLabels[t.status] || t.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">{formatDateShort(t.dataProxima)}</td>
                <td className="px-4 py-3">{t.responsavel?.name || "—"}</td>
              </tr>
            ))}
            {tratamentos.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[var(--muted)]"
                >
                  Nenhum tratamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao
        basePath="/tratamentos"
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        params={filterParams}
      />
    </div>
  );
}
