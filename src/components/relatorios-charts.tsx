"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Serie = { name: string; value: number };

type ProfissionalClinica = {
  clinica: string;
  profissional: string;
  ocorrencias: number;
};

type EvolucaoPonto = {
  label: string;
  total: number;
};

type ClinicaComparativo = {
  name: string;
  reclamacoes: number;
  tratamentos: number;
};

const ALTURA_GRAFICO = 288;

const CORES = [
  "#ffce00",
  "#111111",
  "#5c5748",
  "#fff176",
  "#e6b800",
  "#ead98a",
  "#888888",
  "#cccccc",
  "#333333",
];

function ChartShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full" style={{ height: ALTURA_GRAFICO }}>
      <ResponsiveContainer width="100%" height={ALTURA_GRAFICO}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState() {
  return (
    <p
      className="flex items-center justify-center text-sm text-[var(--muted)]"
      style={{ height: ALTURA_GRAFICO }}
    >
      Nenhuma ocorrência no período selecionado
    </p>
  );
}

function tooltipPct(total: number) {
  return (value: unknown, _name: unknown, item: unknown) => {
    const num = Number(value ?? 0);
    const pct = total > 0 ? Math.round((num / total) * 100) : 0;
    const nome =
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      typeof (item as { name: unknown }).name === "string"
        ? (item as { name: string }).name
        : "Ocorrências";
    return [`${num} (${pct}%)`, nome];
  };
}

function Top10Ranking({ title, data }: { title: string; data: Serie[] }) {
  const top = data.slice(0, 10);
  const max = top[0]?.value ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-3">
            {top.map((item, index) => (
              <li key={item.name} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        index < 3
                          ? "bg-[var(--brand)] text-black"
                          : "bg-[var(--surface-2)] text-[var(--muted)]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="truncate font-medium">{item.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand)]"
                    style={{ width: `${(item.value / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PieCard({ title, data }: { title: string; data: Serie[] }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartShell>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipPct(total)} />
              <Legend />
            </PieChart>
          </ChartShell>
        )}
      </CardContent>
    </Card>
  );
}

function AbertasVsEncerradasChart({ data }: { data: Serie[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Abertas vs encerradas</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartShell>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={96}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="value" name="Reclamações" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={index === 0 ? "#ffce00" : "#111111"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartShell>
        )}
      </CardContent>
    </Card>
  );
}

function ClinicaComparativoChart({ data }: { data: ClinicaComparativo[] }) {
  const altura = Math.max(ALTURA_GRAFICO, data.length * 36);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Reclamações e tratamentos por clínica</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="w-full" style={{ height: altura }}>
            <ResponsiveContainer width="100%" height={altura}>
              <BarChart data={data} margin={{ bottom: 64, left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={72}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="reclamacoes"
                  name="Reclamações"
                  fill="#ffce00"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="tratamentos"
                  name="Tratamentos vinculados"
                  fill="#111111"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EvolucaoChart({ data }: { data: EvolucaoPonto[] }) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Evolução no período</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartShell>
            <AreaChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                name="Reclamações"
                stroke="#111111"
                fill="#ffce00"
                fillOpacity={0.35}
              />
            </AreaChart>
          </ChartShell>
        )}
      </CardContent>
    </Card>
  );
}

function StatusDonut({ data }: { data: Serie[] }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por status</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ChartShell>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipPct(total)} />
              <Legend />
            </PieChart>
          </ChartShell>
        )}
      </CardContent>
    </Card>
  );
}

function ProfissionalPorClinicaChart({
  data,
}: {
  data: ProfissionalClinica[];
}) {
  const top = data.slice(0, 10).map((item) => ({
    rotulo:
      item.clinica.length > 22
        ? `${item.clinica.slice(0, 20)}…`
        : item.clinica,
    clinica: item.clinica,
    profissional: item.profissional,
    ocorrencias: item.ocorrencias,
  }));
  const altura = Math.max(ALTURA_GRAFICO, top.length * 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profissional com mais reclamações por clínica</CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="w-full" style={{ height: altura }}>
            <ResponsiveContainer width="100%" height={altura}>
              <BarChart
                data={top}
                layout="vertical"
                margin={{ left: 8, right: 24, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="rotulo"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const row = payload[0].payload as (typeof top)[number];
                    return (
                      <div className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-md">
                        <p className="font-medium">{row.clinica}</p>
                        <p className="text-[var(--muted)]">{row.profissional}</p>
                        <p className="mt-1 font-semibold">
                          {row.ocorrencias} ocorrência
                          {row.ocorrencias !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="ocorrencias"
                  name="Ocorrências"
                  fill="#ffce00"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RelatoriosCharts({
  clinicas,
  motivos,
  cidades,
  estados,
  canais,
  status,
  evolucao,
  profissionaisClinica,
  abertasVsEncerradas,
  tratamentosResumo,
  reclamacoesComTratamento,
  clinicasComparativo,
}: {
  clinicas: Serie[];
  motivos: Serie[];
  cidades: Serie[];
  estados: Serie[];
  canais: Serie[];
  status: Serie[];
  evolucao: EvolucaoPonto[];
  profissionaisClinica: ProfissionalClinica[];
  abertasVsEncerradas: Serie[];
  tratamentosResumo: Serie[];
  reclamacoesComTratamento: Serie[];
  clinicasComparativo: ClinicaComparativo[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <EvolucaoChart data={evolucao} />
        <StatusDonut data={status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AbertasVsEncerradasChart data={abertasVsEncerradas} />
        <PieCard
          title="Reclamações com tratamento"
          data={reclamacoesComTratamento}
        />
        <PieCard
          title="Tratamentos vinculados no período"
          data={tratamentosResumo}
        />
      </div>

      <ClinicaComparativoChart data={clinicasComparativo} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Top10Ranking title="Top 10 clínicas" data={clinicas} />
        <Top10Ranking title="Top 10 motivos" data={motivos} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PieCard title="Ocorrências por cidade" data={cidades} />
        <PieCard title="Ocorrências por estado" data={estados} />
      </div>

      <ProfissionalPorClinicaChart data={profissionaisClinica} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PieCard title="Canais de origem" data={canais} />
      </div>
    </div>
  );
}
