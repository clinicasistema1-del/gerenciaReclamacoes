"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { statusTratamentoLabels } from "@/lib/labels";

export function TratamentosFiltros({
  q,
  status,
}: {
  q?: string;
  status?: string;
}) {
  const [statusAtual, setStatusAtual] = useState(status || "");

  return (
    <form className="flex flex-wrap gap-3">
      <input
        name="q"
        placeholder="Protocolo, paciente ou descrição"
        defaultValue={q}
        className="h-10 rounded-md border border-[var(--border)] px-3 text-sm"
      />
      <div className="min-w-[220px] flex-1">
        <SearchableSelect
          id="status"
          name="status"
          value={statusAtual}
          placeholder="Todos os status"
          options={[
            { value: "", label: "Todos os status" },
            ...Object.entries(statusTratamentoLabels).map(([k, v]) => ({
              value: k,
              label: v,
            })),
          ]}
          onChange={setStatusAtual}
        />
      </div>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
