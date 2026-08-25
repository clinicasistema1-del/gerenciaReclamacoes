"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTratamento } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

export function VincularTratamentoButton({
  reclamacaoId,
  tratamentoId,
  defaultResponsavelId,
  defaultClinicId,
  usuarios,
  clinicas,
  disabled,
}: {
  reclamacaoId: string;
  tratamentoId?: string | null;
  defaultResponsavelId: string;
  defaultClinicId: string;
  usuarios: { id: string; name: string }[];
  clinicas: { id: string; name: string; city: string; state: string }[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [responsavelId, setResponsavelId] = useState(defaultResponsavelId);
  const [clinicId, setClinicId] = useState(defaultClinicId);

  if (tratamentoId) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => router.push(`/tratamentos/${tratamentoId}`)}
      >
        Visualizar tratamento
      </Button>
    );
  }

  async function enviar(formData: FormData) {
    const result = await createTratamento(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    setAberto(false);
    router.push(`/tratamentos/${result.id}`);
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={disabled}
        onClick={() => {
          setResponsavelId(defaultResponsavelId);
          setClinicId(defaultClinicId);
          setAberto(true);
        }}
      >
        Vincular tratamento
      </Button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Vincular tratamento</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Defina o cuidado vinculado a esta reclamação. Você poderá registrar
              retornos e evoluções depois.
            </p>
            <form action={enviar} className="mt-4 space-y-4">
              <input type="hidden" name="reclamacaoId" value={reclamacaoId} />
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  required
                  rows={3}
                  placeholder="Ex.: Retorno clínico para avaliação do procedimento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavelId">Responsável pelo atendimento</Label>
                <SearchableSelect
                  id="responsavelId"
                  name="responsavelId"
                  required
                  value={responsavelId}
                  placeholder="Selecione o responsável"
                  options={usuarios.map((u) => ({
                    value: u.id,
                    label: u.name,
                  }))}
                  onChange={setResponsavelId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataProxima">Data do próximo tratamento</Label>
                <Input
                  id="dataProxima"
                  name="dataProxima"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicId">Clínica</Label>
                <SearchableSelect
                  id="clinicId"
                  name="clinicId"
                  required
                  value={clinicId}
                  placeholder="Selecione a clínica"
                  options={clinicas.map((c) => ({
                    value: c.id,
                    label: `${c.name} — ${c.city}/${c.state}`,
                  }))}
                  onChange={setClinicId}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Vincular</Button>
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
              : "Não foi possível vincular"
          }
          message={erro}
          onClose={() => setErro("")}
        />
      )}
    </>
  );
}
