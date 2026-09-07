"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useState } from "react";

export function EsteiraClinicaGate({
  clinicas,
  clinicId = "",
}: {
  clinicas: { id: string; name: string; city: string; state: string }[];
  clinicId?: string;
}) {
  const router = useRouter();
  const [selecionada, setSelecionada] = useState(clinicId);

  function aplicar(id: string) {
    setSelecionada(id);
    if (!id) {
      router.push("/admin/esteira");
      return;
    }
    router.push(`/admin/esteira?clinicId=${encodeURIComponent(id)}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[260px] flex-1 space-y-2">
        <Label htmlFor="clinicIdGate">Clínica</Label>
        <SearchableSelect
          id="clinicIdGate"
          name="clinicId"
          value={selecionada}
          placeholder="Selecione ou pesquise a clínica"
          options={clinicas.map((c) => ({
            value: c.id,
            label: `${c.name} — ${c.city}/${c.state}`,
          }))}
          onChange={aplicar}
        />
      </div>
      {clinicId ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => aplicar("")}
        >
          Trocar clínica
        </Button>
      ) : null}
    </div>
  );
}
