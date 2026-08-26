import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatoriosCharts } from "@/components/relatorios-charts";
import { RelatoriosFiltros } from "@/components/relatorios-filtros";
import { canalLabels, motivoLabels, statusLabels } from "@/lib/labels";
import {
  agruparComOutros,
  formatDateShort,
  parsePeriodoRelatorios,
} from "@/lib/utils";

function toArr(map: Map<string, number>) {
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function semanaLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function diaLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  await requireSession();
  const params = await searchParams;
  const { de, ate, inicio, fim } = parsePeriodoRelatorios(params.de, params.ate);

  const reclamacoes = await prisma.reclamacao.findMany({
    where: {
      createdAt: { gte: inicio, lte: fim },
    },
    include: {
      clinic: true,
      responsavel: true,
      tratamentos: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const tratamentos = await prisma.tratamento.findMany({
    where: {
      createdAt: { gte: inicio, lte: fim },
    },
    include: { clinic: true },
  });

  const total = reclamacoes.length;
  const vencidos = reclamacoes.filter((r) => r.status === "ATRASADA").length;
  const encerradas = reclamacoes.filter((r) =>
    ["CONCLUIDA", "ENCERRADA"].includes(r.status)
  ).length;
  const abertas = total - encerradas;
  const comTratamento = reclamacoes.filter((r) => r.tratamentos.length > 0).length;

  const tempos = reclamacoes
    .filter((r) => r.concluidaEm && ["CONCLUIDA", "ENCERRADA"].includes(r.status))
    .map(
      (r) =>
        (r.concluidaEm!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60)
    );
  const tempoMedio =
    tempos.length > 0
      ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
      : 0;

  const pctEncerradas =
    total > 0 ? Math.round((encerradas / total) * 100) : 0;

  const porClinicaMap = new Map<string, number>();
  const porClinicaTratamentoMap = new Map<string, number>();
  const porCidadeMap = new Map<string, number>();
  const porEstadoMap = new Map<string, number>();
  const porCanalMap = new Map<string, number>();
  const porMotivoMap = new Map<string, number>();
  const porStatusMap = new Map<string, number>();
  const profissionaisPorClinica = new Map<string, Map<string, number>>();

  const diasPeriodo =
    Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const evolucaoMap = new Map<string, number>();

  for (const r of reclamacoes) {
    porClinicaMap.set(
      r.clinic.name,
      (porClinicaMap.get(r.clinic.name) || 0) + 1
    );
    porCidadeMap.set(
      r.clinic.city,
      (porCidadeMap.get(r.clinic.city) || 0) + 1
    );
    porEstadoMap.set(
      r.clinic.state,
      (porEstadoMap.get(r.clinic.state) || 0) + 1
    );
    const canal = canalLabels[r.canal] || r.canal;
    porCanalMap.set(canal, (porCanalMap.get(canal) || 0) + 1);
    const motivo = motivoLabels[r.motivo] || r.motivo;
    porMotivoMap.set(motivo, (porMotivoMap.get(motivo) || 0) + 1);
    const status = statusLabels[r.status] || r.status;
    porStatusMap.set(status, (porStatusMap.get(status) || 0) + 1);

    const profissional = r.responsavel?.name || "Sem responsável";
    const porProf = profissionaisPorClinica.get(r.clinic.name) ?? new Map();
    porProf.set(profissional, (porProf.get(profissional) || 0) + 1);
    profissionaisPorClinica.set(r.clinic.name, porProf);

    const chaveEvolucao =
      diasPeriodo <= 31
        ? diaLabel(r.createdAt)
        : semanaLabel(r.createdAt);
    evolucaoMap.set(chaveEvolucao, (evolucaoMap.get(chaveEvolucao) || 0) + 1);
  }

  for (const t of tratamentos) {
    porClinicaTratamentoMap.set(
      t.clinic.name,
      (porClinicaTratamentoMap.get(t.clinic.name) || 0) + 1
    );
  }

  const tratamentosEmAndamento = tratamentos.filter(
    (t) => t.status === "EM_ANDAMENTO"
  ).length;
  const tratamentosFinalizados = tratamentos.filter(
    (t) => t.status === "CONCLUIDO"
  ).length;

  const abertasVsEncerradas = [
    { name: "Em aberto", value: abertas },
    { name: "Encerradas", value: encerradas },
  ].filter((item) => item.value > 0);

  const tratamentosResumo = [
    { name: "Vinculados no período", value: tratamentos.length },
    { name: "Em andamento", value: tratamentosEmAndamento },
    { name: "Finalizados", value: tratamentosFinalizados },
  ].filter((item) => item.value > 0);

  const reclamacoesComTratamento = [
    { name: "Com tratamento", value: comTratamento },
    { name: "Sem tratamento", value: total - comTratamento },
  ].filter((item) => item.value > 0);

  const clinicasComparativo = [...porClinicaMap.entries()]
    .map(([name, reclamacoesCount]) => ({
      name,
      reclamacoes: reclamacoesCount,
      tratamentos: porClinicaTratamentoMap.get(name) || 0,
    }))
    .sort((a, b) => b.reclamacoes - a.reclamacoes)
    .slice(0, 10);

  const profissionaisClinica = [...profissionaisPorClinica.entries()]
    .map(([clinica, profs]) => {
      const lider = [...profs.entries()].sort((a, b) => b[1] - a[1])[0];
      return {
        clinica,
        profissional: lider?.[0] ?? "Sem responsável",
        ocorrencias: lider?.[1] ?? 0,
      };
    })
    .sort((a, b) => b.ocorrencias - a.ocorrencias);

  const evolucao = [...evolucaoMap.entries()].map(([label, total]) => ({
    label,
    total,
  }));

  const kpis = [
    { label: "Reclamações no período", value: total },
    { label: "Tempo médio (horas)", value: tempoMedio },
    { label: "Protocolos vencidos", value: vencidos },
    { label: "% encerradas", value: `${pctEncerradas}%` },
    { label: "Tratamentos vinculados", value: tratamentos.length },
    { label: "Reclamações c/ tratamento", value: comTratamento },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Central de relatórios
        </h1>
        <p className="text-[var(--muted)]">
          Período: {formatDateShort(inicio)} – {formatDateShort(fim)}
        </p>
      </div>

      <RelatoriosFiltros de={de} ate={ate} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[var(--muted)]">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-[family-name:var(--font-display)] text-3xl">
                {kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <RelatoriosCharts
        clinicas={toArr(porClinicaMap)}
        motivos={toArr(porMotivoMap)}
        cidades={agruparComOutros(porCidadeMap)}
        estados={agruparComOutros(porEstadoMap)}
        canais={toArr(porCanalMap)}
        status={toArr(porStatusMap)}
        evolucao={evolucao}
        profissionaisClinica={profissionaisClinica}
        abertasVsEncerradas={abertasVsEncerradas}
        tratamentosResumo={tratamentosResumo}
        reclamacoesComTratamento={reclamacoesComTratamento}
        clinicasComparativo={clinicasComparativo}
      />
    </div>
  );
}
