"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  hojeIsoSaoPaulo,
  inicioMesAtualSaoPaulo,
} from "@/lib/utils";

function mesAnteriorIso() {
  const hoje = new Date();
  const ref = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, "0");
  const ultimoDia = new Date(y, ref.getMonth() + 1, 0).getDate();
  return {
    de: `${y}-${m}-01`,
    ate: `${y}-${m}-${String(ultimoDia).padStart(2, "0")}`,
  };
}

function ultimos30DiasIso() {
  const ate = hojeIsoSaoPaulo();
  const ref = new Date();
  ref.setDate(ref.getDate() - 29);
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, "0");
  const d = String(ref.getDate()).padStart(2, "0");
  return { de: `${y}-${m}-${d}`, ate };
}

export function RelatoriosFiltros({
  de,
  ate,
  basePath = "/relatorios",
}: {
  de: string;
  ate: string;
  basePath?: string;
}) {
  const mesAtual = { de: inicioMesAtualSaoPaulo(), ate: hojeIsoSaoPaulo() };
  const mesAnt = mesAnteriorIso();
  const ultimos30 = ultimos30DiasIso();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Período</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label htmlFor="de" className="text-xs text-[var(--muted)]">
              De
            </label>
            <input
              id="de"
              name="de"
              type="date"
              defaultValue={de}
              className="block h-10 rounded-md border border-[var(--border)] px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="ate" className="text-xs text-[var(--muted)]">
              Até
            </label>
            <input
              id="ate"
              name="ate"
              type="date"
              defaultValue={ate}
              className="block h-10 rounded-md border border-[var(--border)] px-3 text-sm"
            />
          </div>
          <Button type="submit" variant="secondary">
            Filtrar
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}?de=${mesAtual.de}&ate=${mesAtual.ate}`}>
              Mês atual
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}?de=${mesAnt.de}&ate=${mesAnt.ate}`}>
              Mês anterior
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}?de=${ultimos30.de}&ate=${ultimos30.ate}`}>
              Últimos 30 dias
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
