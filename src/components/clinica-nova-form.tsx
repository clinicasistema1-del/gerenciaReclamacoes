"use client";

import { useRef, useState } from "react";
import { createClinic } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClinicaLocalidadeFields } from "@/components/clinica-localidade-fields";
import { FeedbackModal } from "@/components/feedback-modal";

export function ClinicaNovaForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [sucesso, setSucesso] = useState("");

  async function cadastrar(formData: FormData) {
    await createClinic(formData);
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
      {sucesso && (
        <FeedbackModal
          title="Cadastro realizado"
          message={sucesso}
          onClose={() => setSucesso("")}
        />
      )}
    </>
  );
}
