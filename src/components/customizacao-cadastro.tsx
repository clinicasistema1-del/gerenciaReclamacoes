"use client";

import { useRef, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";
import type { ActionResult } from "@/lib/action-result";

type Item = {
  id: string;
  descricao: string;
};

type DeleteResult =
  | { ok: true }
  | { ok: false; reclamacoes: number; error?: string };

export function CustomizacaoCadastro({
  titulo,
  rotuloSingular,
  itens,
  createAction,
  updateAction,
  deleteAction,
}: {
  titulo: string;
  rotuloSingular: string;
  itens: Item[];
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (id: string) => Promise<DeleteResult>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<Item | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(formData: FormData) {
    const result = await createAction(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    formRef.current?.reset();
    setSucesso(`${rotuloSingular} cadastrado.`);
  }

  async function salvar(formData: FormData) {
    const result = await updateAction(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    setEditandoId(null);
    setSucesso(`${rotuloSingular} atualizado.`);
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setEnviando(true);
    setErro("");
    const result = await deleteAction(excluindo.id);
    setEnviando(false);
    if (!result.ok) {
      setExcluindo(null);
      setErro(
        result.error ||
          `Não é possível excluir. Há ${result.reclamacoes} reclamação(ões) vinculada(s).`
      );
      return;
    }
    setExcluindo(null);
    setSucesso(`${rotuloSingular} excluído.`);
  }

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
          <CardTitle>{titulo}</CardTitle>
          <span className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-xs font-medium tabular-nums text-[var(--muted)]">
            {itens.length}
          </span>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <form
            ref={formRef}
            action={cadastrar}
            className="flex items-center gap-2"
          >
            <Input
              name="descricao"
              placeholder={`Novo ${rotuloSingular.toLowerCase()}`}
              required
              className="h-9"
            />
            <Button
              type="submit"
              size="sm"
              className="shrink-0"
              aria-label={`Cadastrar ${rotuloSingular.toLowerCase()}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          {itens.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--muted)]">
              Nenhum item cadastrado
            </p>
          ) : (
            <ul className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-1">
              {itens.map((item) => {
                const editando = editandoId === item.id;
                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  >
                    {editando ? (
                      <form
                        action={salvar}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <Input
                          name="descricao"
                          defaultValue={item.descricao}
                          required
                          autoFocus
                          className="h-8"
                        />
                        <Button type="submit" size="sm" variant="secondary">
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditandoId(null)}
                          aria-label="Cancelar edição"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">
                          {item.descricao}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditandoId(item.id)}
                          className="rounded-md p-1.5 text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"
                          aria-label={`Editar ${item.descricao}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setExcluindo(item)}
                          className="rounded-md p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
                          aria-label={`Excluir ${item.descricao}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {excluindo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Excluir registro</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Confirma a exclusão de <strong>{excluindo.descricao}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExcluindo(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={enviando}
                onClick={confirmarExclusao}
              >
                {enviando ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {erro && (
        <FeedbackModal
          variant={variantFromMessage(erro)}
          title={
            variantFromMessage(erro) === "warning"
              ? "Atenção"
              : "Não foi possível concluir"
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
