import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { AvaliacoesGerirFiltros } from "@/components/avaliacoes-gerir-filtros";
import { CopiarLinkButton } from "@/components/copiar-link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, parsePeriodoRelatorios } from "@/lib/utils";

export default async function GerirAvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string; status?: string }>;
}) {
  await requireSession();
  const params = await searchParams;
  const { de, ate, inicio, fim } = parsePeriodoRelatorios(params.de, params.ate);
  const status = params.status === "respondida" || params.status === "aguardando"
    ? params.status
    : undefined;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const respostas = await prisma.npsResposta.findMany({
    where: {
      createdAt: { gte: inicio, lte: fim },
      ...(status === "respondida" ? { respondidoEm: { not: null } } : {}),
      ...(status === "aguardando" ? { respondidoEm: null } : {}),
    },
    include: {
      reclamacao: { include: { clinic: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Gerir avaliações
          </h1>
          <p className="text-[var(--muted)]">
            Lista de pesquisas geradas com status e link de resposta
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/nps?de=${de}&ate=${ate}`}>Voltar para Avaliações</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <AvaliacoesGerirFiltros de={de} ate={ate} status={status} />
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Gerada em</th>
              <th className="px-4 py-3 font-medium">Link</th>
            </tr>
          </thead>
          <tbody>
            {respostas.map((item) => {
              const url = `${baseUrl}/nps/${item.token}`;
              const respondida = Boolean(item.respondidoEm);
              return (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/reclamacoes/${item.reclamacaoId}`}
                      className="font-medium text-black hover:underline"
                    >
                      {item.reclamacao.protocolo}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">
                      {item.reclamacao.clinic.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">{item.reclamacao.pacienteNome}</td>
                  <td className="px-4 py-3">
                    {respondida ? (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        Respondida
                        {item.nota != null ? ` · Nota ${item.nota}` : ""}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800">
                        Aguardando
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    <CopiarLinkButton url={url} />
                  </td>
                </tr>
              );
            })}
            {respostas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[var(--muted)]"
                >
                  Nenhuma avaliação encontrada para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
