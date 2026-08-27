"use client";

import { Button } from "@/components/ui/button";

export function AvaliacoesGerirFiltros({
  de,
  ate,
  status,
}: {
  de: string;
  ate: string;
  status?: string;
}) {
  return (
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
      <div className="space-y-1">
        <label htmlFor="status" className="text-xs text-[var(--muted)]">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status || ""}
          className="block h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm"
        >
          <option value="">Todos</option>
          <option value="aguardando">Aguardando</option>
          <option value="respondida">Respondida</option>
        </select>
      </div>
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
