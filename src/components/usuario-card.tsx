"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { updateUser, deleteUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackModal } from "@/components/feedback-modal";
import { cargoLabels, roleLabels } from "@/lib/labels";

const selectClass =
  "flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: string;
  cargo: string | null;
  clinicId: string | null;
  active: boolean;
  reclamacoes: number;
  tratamentos: number;
  historicos: number;
  etapas: number;
};

export function UsuarioCard({
  usuario,
  clinicas,
  currentUserId,
  onExcluido,
}: {
  usuario: Usuario;
  clinicas: { id: string; name: string }[];
  currentUserId: string;
  onExcluido: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const ehLogado = usuario.id === currentUserId;
  const podeExcluir =
    !ehLogado &&
    usuario.reclamacoes === 0 &&
    usuario.tratamentos === 0 &&
    usuario.historicos === 0 &&
    usuario.etapas === 0;

  async function salvar(formData: FormData) {
    const result = await updateUser(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    setSucesso("Usuário atualizado.");
  }

  async function confirmar() {
    if (!podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteUser(usuario.id);
    setEnviando(false);
    if (!result.ok) {
      if ("error" in result && result.error) {
        setErro(result.error);
        return;
      }
      if (result.motivo === "self") {
        setErro("Não é possível excluir o usuário logado.");
        return;
      }
      setErro(
        `Não é possível excluir. Há ${result.reclamacoes} reclamação(ões), ${result.tratamentos} tratamento(s), ${result.historicos} registro(s) de histórico e ${result.etapas} etapa(s) da esteira vinculados.`
      );
      return;
    }
    setAberto(false);
    onExcluido();
  }

  return (
    <>
      <Card className="relative">
        <button
          type="button"
          onClick={() => {
            setErro("");
            setAberto(true);
          }}
          className="absolute right-4 top-4 rounded-md p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
          aria-label="Excluir usuário"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <CardContent className="pt-5 pr-14">
          <form action={salvar} className="grid gap-3 md:grid-cols-6 items-end">
            <input type="hidden" name="id" value={usuario.id} />
            <div className="space-y-2 md:col-span-2">
              <div className="flex min-h-5 items-baseline justify-between gap-2">
                <Label>Nome</Label>
                <span className="truncate text-xs text-[var(--muted)]">
                  {usuario.email}
                </span>
              </div>
              <Input name="name" defaultValue={usuario.name} required />
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <select
                name="role"
                defaultValue={usuario.role}
                className={selectClass}
              >
                {Object.entries(roleLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <select
                name="cargo"
                defaultValue={usuario.cargo || ""}
                className={selectClass}
              >
                <option value="">Sem cargo</option>
                {Object.entries(cargoLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Clínica</Label>
              <select
                name="clinicId"
                defaultValue={usuario.clinicId || ""}
                className={selectClass}
              >
                <option value="">Rede / sem unidade</option>
                {clinicas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex h-10 items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={usuario.active}
                />
                Ativo
              </label>
              <Button type="submit" variant="secondary" size="sm">
                Salvar
              </Button>
              <Badge
                className={
                  usuario.active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }
              >
                {usuario.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Excluir usuário</h2>
            {ehLogado ? (
              <p className="mt-2 text-sm text-red-700">
                Não é possível excluir o usuário logado.
              </p>
            ) : podeExcluir ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Confirma a exclusão de <strong>{usuario.name}</strong>? Esta ação
                não pode ser desfeita.
              </p>
            ) : (
              <p className="mt-2 text-sm text-red-700">
                Não é possível excluir <strong>{usuario.name}</strong>. Há{" "}
                {usuario.reclamacoes} reclamação(ões), {usuario.tratamentos}{" "}
                tratamento(s), {usuario.historicos} registro(s) de histórico e{" "}
                {usuario.etapas} etapa(s) da esteira vinculados.
              </p>
            )}
            {erro && <p className="mt-2 text-sm text-red-700">{erro}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAberto(false)}
              >
                Cancelar
              </Button>
              {podeExcluir && (
                <Button
                  type="button"
                  variant="danger"
                  disabled={enviando}
                  onClick={confirmar}
                >
                  {enviando ? "Excluindo..." : "Excluir"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {erro && !aberto && (
        <FeedbackModal
          title="Não foi possível salvar"
          message={erro}
          onClose={() => setErro("")}
        />
      )}
      {sucesso && (
        <FeedbackModal
          title="Concluído"
          message={sucesso}
          onClose={() => setSucesso("")}
        />
      )}
    </>
  );
}
