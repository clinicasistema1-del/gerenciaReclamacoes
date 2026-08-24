"use client";

import { useRef, useState } from "react";
import { createUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FeedbackModal } from "@/components/feedback-modal";
import { roleLabels } from "@/lib/labels";

const selectClass =
  "flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm";

export function UsuarioNovaForm({
  clinicas,
}: {
  clinicas: { id: string; name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sucesso, setSucesso] = useState("");

  async function cadastrar(formData: FormData) {
    await createUser(formData);
    formRef.current?.reset();
    setSucesso("Usuário cadastrado.");
  }

  return (
    <>
      <form ref={formRef} action={cadastrar} className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Perfil</Label>
          <select
            id="role"
            name="role"
            className={selectClass}
            defaultValue="SAC"
          >
            {Object.entries(roleLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="clinicId">Clínica (opcional)</Label>
          <select id="clinicId" name="clinicId" className={selectClass}>
            <option value="">Rede / sem unidade</option>
            {clinicas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
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
