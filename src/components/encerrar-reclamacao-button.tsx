"use client";

import { useState } from "react";
import { encerrarReclamacao } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

export function EncerrarReclamacaoButton({
  reclamacaoId,
  jaEncerrada,
  tratamentoAberto = false,
}: {
  reclamacaoId: string;
  jaEncerrada: boolean;
  tratamentoAberto?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(formData: FormData) {
    const result = await encerrarReclamacao(formData);
    if (result && !result.ok) {
      setErro(result.error);
    }
  }

  if (jaEncerrada) {
    return (
      <Button type="button" className="w-full" disabled>
        Encerrar reclamação
      </Button>
    );
  }

  if (tratamentoAberto) {
    return (
      <>
        <Button
          type="button"
          className="w-full"
          onClick={() =>
            setErro(
              "Não é possível encerrar a reclamação vinculada a um tratamento. Finalize o tratamento antes."
            )
          }
        >
          Encerrar reclamação
        </Button>
        {erro && (
          <FeedbackModal
            variant="warning"
            title="Atenção"
            message={erro}
            onClose={() => setErro("")}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button type="button" className="w-full" onClick={() => setAberto(true)}>
        Encerrar reclamação
      </Button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Encerrar reclamação</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Informe o parecer final. Ao encerrar, a reclamação será finalizada
              e o NPS será gerado.
            </p>
            <form action={enviar} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={reclamacaoId} />
              <div className="space-y-2">
                <Label htmlFor="parecerFinal">Parecer final</Label>
                <Textarea
                  id="parecerFinal"
                  name="parecerFinal"
                  required
                  rows={4}
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
                <Button type="submit">Encerrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {erro && (
        <FeedbackModal
          variant={variantFromMessage(erro)}
          title={
            variantFromMessage(erro) === "warning"
              ? "Atenção"
              : "Não foi possível encerrar"
          }
          message={erro}
          onClose={() => setErro("")}
        />
      )}
    </>
  );
}
