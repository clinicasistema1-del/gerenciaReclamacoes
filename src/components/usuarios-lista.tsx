"use client";

import { useState } from "react";
import { UsuarioCard } from "@/components/usuario-card";
import { FeedbackModal } from "@/components/feedback-modal";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: string;
  cargo: string | null;
  clinicId: string | null;
  active: boolean;
  reclamacoes: number;
  tratamentos: number;
  historicos: number;
  etapas: number;
};

export function UsuariosLista({
  usuarios,
  clinicas,
  currentUserId,
}: {
  usuarios: Usuario[];
  clinicas: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [sucesso, setSucesso] = useState("");

  return (
    <>
      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Usuários cadastrados
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {usuarios.length === 0
              ? "Nenhum usuário cadastrado"
              : `${usuarios.length} usuário${usuarios.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {usuarios.map((u) => (
          <UsuarioCard
            key={u.id}
            usuario={u}
            clinicas={clinicas}
            currentUserId={currentUserId}
            onExcluido={() => setSucesso("Usuário excluído.")}
          />
        ))}
      </section>
      {sucesso && (
        <FeedbackModal
          variant="success"
          title="Concluído"
          message={sucesso}
          onClose={() => setSucesso("")}
        />
      )}
    </>
  );
}
