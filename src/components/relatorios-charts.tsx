"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Serie = { name: string; value: number };

function ChartCard({ title, data }: { title: string; data: Serie[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {data.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Sem dados</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f7a5f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function RelatoriosCharts({
  clinicas,
  canais,
  motivos,
  responsaveis,
  cidades,
}: {
  clinicas: Serie[];
  canais: Serie[];
  motivos: Serie[];
  responsaveis: Serie[];
  cidades: Serie[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Clínicas com mais ocorrências" data={clinicas} />
      <ChartCard title="Canais que mais geram reclamação" data={canais} />
      <ChartCard title="Motivos mais frequentes" data={motivos} />
      <ChartCard title="Carteira por responsável" data={responsaveis} />
      <ChartCard title="Cidades / estados" data={cidades} />
    </div>
  );
}
