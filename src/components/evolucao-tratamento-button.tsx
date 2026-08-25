"use client";

import { useState } from "react";
import { adicionarEvolucaoTratamento } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

export function EvolucaoTratamentoButton({
  tratamentoId,
}: {
  tratamentoId: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(formData: FormData) {
    const result = await adicionarEvolucaoTratamento(formData);
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
            <h2 className="text-lg font-semibold">Evolução do tratamento</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Registre o retorno ou andamento do cuidado. Se houver novo
              agendamento, informe a próxima data.
            </p>
            <form action={enviar} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={tratamentoId} />
              <div className="space-y-2">
                <Label htmlFor="evolucao">Evolução</Label>
                <Textarea
                  id="evolucao"
                  name="evolucao"
                  required
                  rows={4}
                  placeholder="Ex.: Paciente compareceu e realizamos ajustes na prótese"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataProxima">Próximo retorno (opcional)</Label>
                <Input id="dataProxima" name="dataProxima" type="date" />
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
          variant={variantFromMessage(erro)}
          title={
            variantFromMessage(erro) === "warning"
              ? "Atenção"
              : "Não foi possível salvar"
          }
          message={erro}
          onClose={() => setErro("")}
        />
      )}
    </>
  );
}
