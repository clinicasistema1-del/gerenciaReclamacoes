"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";
import type { ActionResult } from "@/lib/action-result";

type Item = {
  id: string;
  descricao: string;
  reclamacoes: number;
};

type DeleteResult =
  | { ok: true }
  | { ok: false; reclamacoes: number; error?: string };

export function CustomizacaoCadastro({
  titulo,
  tituloNovo,
  rotuloSingular,
  itens,
  createAction,
  updateAction,
  deleteAction,
}: {
  titulo: string;
  tituloNovo: string;
  rotuloSingular: string;
  itens: Item[];
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (id: string) => Promise<DeleteResult>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const itemExclusao = itens.find((item) => item.id === excluindoId) ?? null;
  const podeExcluir = itemExclusao ? itemExclusao.reclamacoes === 0 : false;

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
    setSucesso(`${rotuloSingular} atualizado.`);
  }

  async function confirmarExclusao() {
    if (!itemExclusao || !podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteAction(itemExclusao.id);
    setEnviando(false);
    if (!result.ok) {
      setErro(
        result.error ||
          `Não é possível excluir. Há ${result.reclamacoes} reclamação(ões) vinculada(s).`
      );
      return;
    }
    setExcluindoId(null);
    setSucesso(`${rotuloSingular} excluído.`);
  }

  return (
    <>
      <Card className="border-[var(--brand)] bg-[var(--surface-2)] shadow-none">
        <CardContent className="space-y-4 pt-5">
          <div>
            <h2 className="text-base font-semibold">{tituloNovo}</h2>
            <p className="text-sm text-[var(--muted)]">
              Cadastre uma descrição para uso na abertura de reclamações
            </p>
          </div>
          <form
            ref={formRef}
            action={cadastrar}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[220px] flex-1 space-y-2">
              <Label htmlFor={`${titulo}-nova-descricao`}>Descrição</Label>
              <Input
                id={`${titulo}-nova-descricao`}
                name="descricao"
                required
              />
            </div>
            <Button type="submit">Cadastrar</Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            {titulo} cadastrados
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {itens.length === 0
              ? `Nenhum ${rotuloSingular.toLowerCase()} cadastrado`
              : `${itens.length} registro${itens.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {itens.map((item) => (
          <Card key={item.id} className="relative">
            <button
              type="button"
              onClick={() => {
                setErro("");
                setExcluindoId(item.id);
              }}
              className="absolute right-4 top-4 rounded-md p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
              aria-label={`Excluir ${item.descricao}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <CardContent className="pt-5 pr-14">
              <form
                action={salvar}
                className="flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="id" value={item.id} />
                <div className="min-w-[220px] flex-1 space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    name="descricao"
                    defaultValue={item.descricao}
                    required
                  />
                </div>
                <p className="pb-2 text-xs text-[var(--muted)]">
                  {item.reclamacoes} reclamação
                  {item.reclamacoes === 1 ? "" : "ões"}
                </p>
                <Button type="submit" variant="secondary" size="sm">
                  Salvar
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>

      {itemExclusao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-xl">
            {!podeExcluir && <div className="h-1.5 w-full bg-amber-500" />}
            <div className="p-6">
              <div className="flex gap-3">
                {!podeExcluir && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle
                      className="h-5 w-5 text-amber-700"
                      aria-hidden
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2
                    className={`text-lg font-semibold ${
                      podeExcluir ? "" : "text-amber-950"
                    }`}
                  >
                    {podeExcluir ? "Excluir registro" : "Atenção"}
                  </h2>
                  {podeExcluir ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Confirma a exclusão de{" "}
                      <strong>{itemExclusao.descricao}</strong>? Esta ação não
                      pode ser desfeita.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Não é possível excluir{" "}
                      <strong>{itemExclusao.descricao}</strong>. Há{" "}
                      {itemExclusao.reclamacoes} reclamação(ões) vinculada(s).
                    </p>
                  )}
                  {erro && (
                    <p className="mt-2 text-sm text-red-700">{erro}</p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setExcluindoId(null)}
                >
                  {podeExcluir ? "Cancelar" : "Fechar"}
                </Button>
                {podeExcluir && (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={enviando}
                    onClick={confirmarExclusao}
                  >
                    {enviando ? "Excluindo..." : "Excluir"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {erro && !itemExclusao && (
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
