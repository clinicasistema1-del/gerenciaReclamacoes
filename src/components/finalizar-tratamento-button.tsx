"use client";

import { useState } from "react";
import { finalizarTratamento } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

export function FinalizarTratamentoButton({
  tratamentoId,
  jaFinalizado,
}: {
  tratamentoId: string;
  jaFinalizado: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(formData: FormData) {
    const result = await finalizarTratamento(formData);
    if (result && !result.ok) {
      setErro(result.error);
    }
  }

  if (jaFinalizado) {
    return (
      <Button type="button" className="w-full" disabled>
        Tratamento finalizado
      </Button>
    );
  }

  return (
    <>
      <Button type="button" className="w-full" onClick={() => setAberto(true)}>
        Finalizar tratamento
      </Button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Finalizar tratamento</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Confirme o encerramento do cuidado. Após finalizar, não será
              possível adicionar novas evoluções.
            </p>
            <form action={enviar} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={tratamentoId} />
              <div className="space-y-2">
                <Label htmlFor="parecer">Parecer de finalização</Label>
                <Textarea
                  id="parecer"
                  name="parecer"
                  required
                  rows={4}
                  placeholder="Ex.: Tratamento concluído com sucesso e alta do paciente"
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
                <Button type="submit">Finalizar</Button>
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
              : "Não foi possível finalizar"
          }
          message={erro}
          onClose={() => setErro("")}
        />
      )}
    </>
  );
}
