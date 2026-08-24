"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { updateEsteira, deleteEsteira } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackModal } from "@/components/feedback-modal";

const selectClass =
  "flex h-10 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm";

type Etapa = {
  id: string;
  nome: string;
  ordem: number;
  prazoDias: number;
  usuarioId: string;
  emailAviso: boolean;
  active: boolean;
  reclamacoes: number;
};

export function EsteiraCard({
  etapa,
  usuarios,
  onExcluida,
}: {
  etapa: Etapa;
  usuarios: { id: string; name: string; email: string }[];
  onExcluida: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const podeExcluir = etapa.reclamacoes === 0;

  async function salvar(formData: FormData) {
    await updateEsteira(formData);
    setSucesso("Etapa atualizada.");
  }

  async function confirmar() {
    if (!podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteEsteira(etapa.id);
    setEnviando(false);
    if (!result.ok) {
      setErro(
        `Não é possível excluir. Há ${result.reclamacoes} reclamação(ões) vinculadas.`
      );
      return;
    }
    setAberto(false);
    onExcluida();
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
          aria-label="Excluir etapa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <CardContent className="pt-5 pr-14">
          <form action={salvar} className="grid gap-3 md:grid-cols-6 items-end">
            <input type="hidden" name="id" value={etapa.id} />
            <div className="space-y-2 md:col-span-2">
              <Label>Nome</Label>
              <Input name="nome" defaultValue={etapa.nome} required />
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                name="ordem"
                type="number"
                min={1}
                defaultValue={etapa.ordem}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo (dias)</Label>
              <Input
                name="prazoDias"
                type="number"
                min={1}
                defaultValue={etapa.prazoDias}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Usuário do alerta</Label>
              <select
                name="usuarioId"
                defaultValue={etapa.usuarioId}
                className={selectClass}
                required
              >
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="emailAviso"
                defaultChecked={etapa.emailAviso}
              />
              E-mail
            </label>
            <div className="flex h-10 items-center gap-3 md:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={etapa.active}
                />
                Ativa
              </label>
              <Button type="submit" variant="secondary" size="sm">
                Salvar
              </Button>
              <Badge
                className={
                  etapa.active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }
              >
                {etapa.active ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Excluir etapa</h2>
            {podeExcluir ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Confirma a exclusão de <strong>{etapa.nome}</strong>? Esta ação
                não pode ser desfeita.
              </p>
            ) : (
              <p className="mt-2 text-sm text-red-700">
                Não é possível excluir <strong>{etapa.nome}</strong>. Há{" "}
                {etapa.reclamacoes} reclamação(ões) vinculadas a esta etapa.
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
