"use client";

import { useState } from "react";
import { EsteiraCard } from "@/components/esteira-card";
import { FeedbackModal } from "@/components/feedback-modal";

type Etapa = {
  id: string;
  nome: string;
  ordem: number;
  prazoDias: number;
  usuarioId: string;
  emailAviso: boolean;
  active: boolean;
  reclamacoes: number;
};

export function EsteiraLista({
  etapas,
  usuarios,
}: {
  etapas: Etapa[];
  usuarios: { id: string; name: string; email: string }[];
}) {
  const [sucesso, setSucesso] = useState("");

  return (
    <>
      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Etapas cadastradas
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {etapas.length === 0
              ? "Nenhuma etapa cadastrada"
              : `${etapas.length} etapa${etapas.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {etapas.map((e) => (
          <EsteiraCard
            key={e.id}
            etapa={e}
            usuarios={usuarios}
            onExcluida={() => setSucesso("Etapa excluída.")}
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
