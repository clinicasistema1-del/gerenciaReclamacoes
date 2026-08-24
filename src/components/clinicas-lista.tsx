"use client";

import { useState } from "react";
import { ClinicaCard } from "@/components/clinica-card";
import { FeedbackModal } from "@/components/feedback-modal";

type Clinica = {
  id: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
  users: number;
  reclamacoes: number;
};

export function ClinicasLista({ clinicas }: { clinicas: Clinica[] }) {
  const [sucesso, setSucesso] = useState("");

  return (
    <>
      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Clínicas cadastradas
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {clinicas.length === 0
              ? "Nenhuma clínica cadastrada"
              : `${clinicas.length} clínica${clinicas.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {clinicas.map((c) => (
          <ClinicaCard
            key={c.id}
            clinica={c}
            onExcluida={() => setSucesso("Clínica excluída.")}
          />
        ))}
      </section>
      {sucesso && (
        <FeedbackModal
          title="Concluído"
          message={sucesso}
          onClose={() => setSucesso("")}
        />
      )}
    </>
  );
}
