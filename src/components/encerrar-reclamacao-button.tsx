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
  const [confirmacaoTratamento, setConfirmacaoTratamento] = useState(false);
  const [formulario, setFormulario] = useState(false);
  const [erro, setErro] = useState("");

  function abrirFluxo() {
    if (tratamentoAberto) {
      setConfirmacaoTratamento(true);
      return;
    }
    setFormulario(true);
  }

  function confirmarTratamento() {
    setConfirmacaoTratamento(false);
    setFormulario(true);
  }

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

  return (
    <>
      <Button type="button" className="w-full" onClick={abrirFluxo}>
        Encerrar reclamação
      </Button>

      {confirmacaoTratamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Tratamento em aberto</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Esta reclamação possui um tratamento em aberto. Se você
              prosseguir, a reclamação e o tratamento serão encerrados juntos.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Deseja continuar mesmo assim?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmacaoTratamento(false)}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={confirmarTratamento}>
                Prosseguir
              </Button>
            </div>
          </div>
        </div>
      )}

      {formulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Encerrar reclamação</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Informe o parecer final. Ao encerrar, a reclamação será finalizada
              e o NPS será gerado
              {tratamentoAberto
                ? ", e o tratamento em aberto também será encerrado"
                : ""}
              .
            </p>
            <form action={enviar} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={reclamacaoId} />
              {tratamentoAberto ? (
                <input type="hidden" name="encerrarTratamento" value="1" />
              ) : null}
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
                  onClick={() => setFormulario(false)}
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
