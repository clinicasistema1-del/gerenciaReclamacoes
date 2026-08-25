"use client";

import { useRef, useState } from "react";
import { createEsteira } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FeedbackModal } from "@/components/feedback-modal";

const selectClass =
  "flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm";

export function EsteiraNovaForm({
  usuarios,
}: {
  usuarios: { id: string; name: string; email: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  async function cadastrar(formData: FormData) {
    const result = await createEsteira(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    formRef.current?.reset();
    setSucesso("Etapa cadastrada.");
  }

  return (
    <>
      <form ref={formRef} action={cadastrar} className="grid gap-3 md:grid-cols-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem</Label>
          <Input id="ordem" name="ordem" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prazoDias">Prazo (dias)</Label>
          <Input id="prazoDias" name="prazoDias" type="number" min={1} required />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="usuarioId">Usuário do alerta</Label>
          <select id="usuarioId" name="usuarioId" className={selectClass} required>
            <option value="">Selecione o usuário</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-end gap-2 text-sm">
          <input type="checkbox" name="emailAviso" defaultChecked />
          Enviar e-mail ao atrasar
        </label>
        <label className="flex items-end gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked />
          Ativa
        </label>
        <div className="md:col-span-4">
          <Button type="submit">Cadastrar</Button>
        </div>
      </form>
      {erro && (
        <FeedbackModal
          title="Não foi possível cadastrar"
          message={erro}
          onClose={() => setErro("")}
        />
      )}
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
