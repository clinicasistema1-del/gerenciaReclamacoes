"use client";

import { useState } from "react";
import { adicionarEvolucao } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackModal } from "@/components/feedback-modal";

export function EvolucaoReclamacaoButton({
  reclamacaoId,
}: {
  reclamacaoId: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(formData: FormData) {
    const result = await adicionarEvolucao(formData);
    if (result && !result.ok) {
      setErro(result.error);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => setAberto(true)}
      >
        Adicionar evolução
      </Button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Evolução</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Descreva o andamento do atendimento. O registro será incluído no
              histórico da reclamação.
            </p>
            <form action={enviar} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={reclamacaoId} />
              <div className="space-y-2">
                <Label htmlFor="evolucao">Evolução</Label>
                <Textarea
                  id="evolucao"
                  name="evolucao"
                  required
                  rows={4}
                  placeholder="Ex.: Entramos em contato com o cliente para marcarmos uma nova consulta"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {erro && (
        <FeedbackModal
          title="Não foi possível salvar"
          message={erro}
          onClose={() => setErro("")}
        />
      )}
    </>
  );
}
