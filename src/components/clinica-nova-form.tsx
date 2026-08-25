"use client";

import { useRef, useState } from "react";
import { createClinic } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClinicaLocalidadeFields } from "@/components/clinica-localidade-fields";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

export function ClinicaNovaForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  async function cadastrar(formData: FormData) {
    const result = await createClinic(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    formRef.current?.reset();
    setSucesso("Clínica cadastrada.");
  }

  return (
    <>
      <form ref={formRef} action={cadastrar} className="grid gap-3 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
        </div>
        <ClinicaLocalidadeFields idPrefix="nova-" />
        <div className="md:col-span-4">
          <Button type="submit">Cadastrar</Button>
        </div>
      </form>
      {erro && (
        <FeedbackModal
          variant={variantFromMessage(erro)}
          title={
            variantFromMessage(erro) === "warning"
              ? "Atenção"
              : "Não foi possível cadastrar"
          }
          message={erro}
          onClose={() => setErro("")}
        />
      )}
      {sucesso && (
        <FeedbackModal
          variant="success"
          title="Cadastro realizado"
          message={sucesso}
          onClose={() => setSucesso("")}
        />
      )}
    </>
  );
}
