"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEsteira } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

const selectClass =
  "flex h-10 w-full cursor-pointer rounded-md border border-[var(--border)] bg-white px-3 text-sm";

export function EsteiraDetalheForm({
  etapa,
  usuarios,
}: {
  etapa: {
    id: string;
    nome: string;
    ordem: number;
    prazoDias: number;
    usuarioId: string;
    active: boolean;
  };
  usuarios: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateEsteira(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    setSucesso("Etapa atualizada.");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={etapa.id} />
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={etapa.nome}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem</Label>
          <Input
            id="ordem"
            name="ordem"
            type="number"
            min={1}
            defaultValue={etapa.ordem}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prazoDias">Prazo (dias)</Label>
          <Input
            id="prazoDias"
            name="prazoDias"
            type="number"
            min={1}
            defaultValue={etapa.prazoDias}
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="usuarioId">Usuário do alerta</Label>
          <select
            id="usuarioId"
            name="usuarioId"
            defaultValue={etapa.usuarioId}
            className={selectClass}
            required
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end md:col-span-2">
          <label className="flex h-10 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={etapa.active}
              className="cursor-pointer"
            />
            Etapa ativa
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
