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

function EmptyState() {
  return (
    <p className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
      Nenhuma ocorrência no período selecionado
    </p>
  );
}

function Top10Ranking({ title, data }: { title: string; data: Serie[] }) {
  const top = data.slice(0, 10);
  const max = top[0]?.value ?? 1;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
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
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72 min-h-0 flex-1">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} (${Math.round((percent ?? 0) * 100)}%)`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => {
                  const num = Number(value ?? 0);
                  const pct =
                    total > 0 ? Math.round((num / total) * 100) : 0;
                  return [`${num} (${pct}%)`, item?.name ?? "Ocorrências"];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function AbertasVsEncerradasChart({ data }: { data: Serie[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Abertas vs encerradas</CardTitle>
      </CardHeader>
      <CardContent className="h-72 min-h-0 flex-1">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
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
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function ClinicaComparativoChart({ data }: { data: ClinicaComparativo[] }) {
  return (
    <Card className="flex h-full flex-col lg:col-span-2">
      <CardHeader>
        <CardTitle>Reclamações e tratamentos por clínica</CardTitle>
      </CardHeader>
      <CardContent className="h-80 min-h-0 flex-1">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
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
        )}
      </CardContent>
    </Card>
  );
}

function EvolucaoChart({ data }: { data: EvolucaoPonto[] }) {
  return (
    <Card className="flex h-full flex-col lg:col-span-2">
      <CardHeader>
        <CardTitle>Evolução no período</CardTitle>
      </CardHeader>
      <CardContent className="h-72 min-h-0 flex-1">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function StatusDonut({ data }: { data: Serie[] }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Distribuição por status</CardTitle>
      </CardHeader>
      <CardContent className="h-72 min-h-0 flex-1">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={75}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => {
                  const num = Number(value ?? 0);
                  const pct =
                    total > 0 ? Math.round((num / total) * 100) : 0;
                  return [`${num} (${pct}%)`, item?.name ?? "Ocorrências"];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function ProfissionalPorClinica({
  data,
}: {
  data: ProfissionalClinica[];
}) {
  const max = data[0]?.ocorrencias ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profissional com mais reclamações por clínica</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-[var(--muted)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2 font-medium">Clínica</th>
                  <th className="px-3 py-2 font-medium">Profissional</th>
                  <th className="px-3 py-2 font-medium">Ocorrências</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">
                    Proporção
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr
                    key={`${item.clinica}-${item.profissional}`}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium">{item.clinica}</td>
                    <td className="px-3 py-2.5">{item.profissional}</td>
                    <td className="px-3 py-2.5 tabular-nums">{item.ocorrencias}</td>
                    <td className="hidden px-3 py-2.5 sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                          <div
                            className="h-full rounded-full bg-[var(--brand)]"
                            style={{
                              width: `${(item.ocorrencias / max) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <PieCard title="Reclamações com tratamento" data={reclamacoesComTratamento} />
        <PieCard title="Tratamentos vinculados no período" data={tratamentosResumo} />
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

      <ProfissionalPorClinica data={profissionaisClinica} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PieCard title="Canais de origem" data={canais} />
      </div>
    </div>
  );
}
