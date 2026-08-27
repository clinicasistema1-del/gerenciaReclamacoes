"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Serie = { name: string; value: number };

const ALTURA_GRAFICO = 288;

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
      Nenhuma avaliação no período selecionado
    </p>
  );
}

export function AvaliacoesCharts({
  geradasVsRespondidas,
  notas,
}: {
  geradasVsRespondidas: Serie[];
  notas: Serie[];
}) {
  const totalGeradas =
    geradasVsRespondidas.find((item) => item.name === "Geradas")?.value ??
    geradasVsRespondidas.reduce((acc, item) => Math.max(acc, item.value), 0);
  const totalNotas = notas.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle>Geradas × respondidas</CardTitle>
          <span className="shrink-0 font-[family-name:var(--font-display)] text-2xl tabular-nums">
            {totalGeradas}
          </span>
        </CardHeader>
        <CardContent>
          {totalGeradas === 0 ? (
            <EmptyState />
          ) : (
            <ChartShell>
              <BarChart
                data={geradasVsRespondidas}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" name="Quantidade" radius={[0, 6, 6, 0]}>
                  {geradasVsRespondidas.map((entry, index) => (
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

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle>Distribuição das notas</CardTitle>
          <span className="shrink-0 font-[family-name:var(--font-display)] text-2xl tabular-nums">
            {totalNotas}
          </span>
        </CardHeader>
        <CardContent>
          {totalNotas === 0 ? (
            <EmptyState />
          ) : (
            <ChartShell>
              <BarChart data={notas} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Respostas" radius={[4, 4, 0, 0]}>
                  {notas.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index % 2 === 0 ? "#ffce00" : "#111111"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartShell>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
