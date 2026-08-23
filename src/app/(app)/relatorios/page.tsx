import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelatoriosCharts } from "@/components/relatorios-charts";
import { canalLabels, motivoLabels } from "@/lib/labels";

export default async function RelatoriosPage() {
  await requireSession();

  const reclamacoes = await prisma.reclamacao.findMany({
    include: {
      clinic: true,
      responsavel: true,
    },
  });

  const total = reclamacoes.length;
  const vencidos = reclamacoes.filter((r) => r.status === "ATRASADA").length;
  const concluidas = reclamacoes.filter((r) =>
    ["CONCLUIDA", "ENCERRADA"].includes(r.status)
  );

  const tempos = concluidas
    .filter((r) => r.concluidaEm)
    .map((r) => (r.concluidaEm!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60));
  const tempoMedio =
    tempos.length > 0
      ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
      : 0;

  const porClinicaMap = new Map<string, number>();
  const porCidadeMap = new Map<string, number>();
  const porCanalMap = new Map<string, number>();
  const porMotivoMap = new Map<string, number>();
  const porResponsavelMap = new Map<string, number>();

  for (const r of reclamacoes) {
    porClinicaMap.set(r.clinic.name, (porClinicaMap.get(r.clinic.name) || 0) + 1);
    const cidade = `${r.clinic.city}/${r.clinic.state}`;
    porCidadeMap.set(cidade, (porCidadeMap.get(cidade) || 0) + 1);
    porCanalMap.set(
      canalLabels[r.canal] || r.canal,
      (porCanalMap.get(canalLabels[r.canal] || r.canal) || 0) + 1
    );
    porMotivoMap.set(
      motivoLabels[r.motivo] || r.motivo,
      (porMotivoMap.get(motivoLabels[r.motivo] || r.motivo) || 0) + 1
    );
    const resp = r.responsavel?.name || "Sem responsável";
    porResponsavelMap.set(resp, (porResponsavelMap.get(resp) || 0) + 1);
  }

  const toArr = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

  const kpis = [
    { label: "Reclamações no período", value: total },
    { label: "Tempo médio (horas)", value: tempoMedio },
    { label: "Protocolos vencidos", value: vencidos },
    {
      label: "No prazo vs vencido",
      value: `${total - vencidos}/${vencidos}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Central de relatórios
        </h1>
        <p className="text-[var(--muted)]">
          Números e rankings para a diretoria decidir
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        canais={toArr(porCanalMap)}
        motivos={toArr(porMotivoMap)}
        responsaveis={toArr(porResponsavelMap)}
        cidades={toArr(porCidadeMap)}
      />
    </div>
  );
}
