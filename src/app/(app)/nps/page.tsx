import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { AvaliacoesCharts } from "@/components/avaliacoes-charts";
import { RelatoriosFiltros } from "@/components/relatorios-filtros";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateShort, parsePeriodoRelatorios } from "@/lib/utils";

export default async function AvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  await requireSession();
  const params = await searchParams;
  const { de, ate, inicio, fim } = parsePeriodoRelatorios(params.de, params.ate);

  const respostas = await prisma.npsResposta.findMany({
    where: {
      createdAt: { gte: inicio, lte: fim },
    },
    orderBy: { createdAt: "desc" },
  });

  const respondidas = respostas.filter((r) => r.respondidoEm);
  const media =
    respondidas.length > 0
      ? (
          respondidas.reduce((acc, r) => acc + (r.nota || 0), 0) /
          respondidas.length
        ).toFixed(1)
      : "—";

  const geradasVsRespondidas = [
    { name: "Geradas", value: respostas.length },
    { name: "Respondidas", value: respondidas.length },
  ];

  const notasMap = new Map<string, number>();
  for (let i = 0; i <= 10; i++) {
    notasMap.set(String(i), 0);
  }
  for (const r of respondidas) {
    if (r.nota == null) continue;
    const chave = String(r.nota);
    notasMap.set(chave, (notasMap.get(chave) || 0) + 1);
  }
  const notas = [...notasMap.entries()].map(([name, value]) => ({
    name,
    value,
  }));

  const pctResposta =
    respostas.length > 0
      ? Math.round((respondidas.length / respostas.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Avaliações
          </h1>
          <p className="text-[var(--muted)]">
            Período: {formatDateShort(inicio)} – {formatDateShort(fim)}
          </p>
        </div>
        <Button asChild>
          <Link href={`/nps/gerir?de=${de}&ate=${ate}`}>Gerir avaliações</Link>
        </Button>
      </div>

      <RelatoriosFiltros de={de} ate={ate} basePath="/nps" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted)]">
              Avaliações geradas
            </CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-display)] text-3xl">
            {respostas.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted)]">
              Respondidas
            </CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-display)] text-3xl">
            {respondidas.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted)]">
              Taxa de resposta
            </CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-display)] text-3xl">
            {pctResposta}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-[var(--muted)]">
              Nota média
            </CardTitle>
          </CardHeader>
          <CardContent className="font-[family-name:var(--font-display)] text-3xl">
            {media}
          </CardContent>
        </Card>
      </div>

      <AvaliacoesCharts
        geradasVsRespondidas={geradasVsRespondidas}
        notas={notas}
      />
    </div>
  );
}
