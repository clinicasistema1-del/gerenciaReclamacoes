"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateClinic } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClinicaLocalidadeFields } from "@/components/clinica-localidade-fields";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

export function ClinicaDetalheForm({
  clinica,
}: {
  clinica: {
    id: string;
    name: string;
    city: string;
    state: string;
    active: boolean;
  };
}) {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateClinic(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    setSucesso("Clínica atualizada.");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={clinica.id} />
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            defaultValue={clinica.name}
            required
          />
        </div>
        <ClinicaLocalidadeFields
          idPrefix="detalhe-"
          defaultState={clinica.state}
          defaultCity={clinica.city}
        />
        <div className="flex items-end md:col-span-2">
          <label className="flex h-10 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={clinica.active}
              className="cursor-pointer"
            />
            Clínica ativa
          </label>
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Salvar alterações</Button>
        </div>
      </form>
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
