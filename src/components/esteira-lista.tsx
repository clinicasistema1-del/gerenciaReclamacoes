"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteEsteira } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/feedback-modal";

type Etapa = {
  id: string;
  nome: string;
  ordem: number;
  prazoDias: number;
  usuarioNome: string;
  active: boolean;
  reclamacoes: number;
};

export function EsteiraLista({ etapas }: { etapas: Etapa[] }) {
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState<Etapa | null>(null);
  const [enviando, setEnviando] = useState(false);

  const podeExcluir = !!excluindo && excluindo.reclamacoes === 0;

  async function confirmar() {
    if (!excluindo || !podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteEsteira(excluindo.id);
    setEnviando(false);
    if (!result.ok) {
      setErro(
        "error" in result && result.error
          ? result.error
          : `Não é possível excluir. Há ${result.reclamacoes} reclamação(ões) vinculadas.`
      );
      return;
    }
    setExcluindo(null);
    setSucesso("Etapa excluída.");
  }

  return (
    <>
      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Etapas cadastradas
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {etapas.length === 0
              ? "Nenhuma etapa cadastrada"
              : `${etapas.length} etapa${etapas.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Ordem</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Prazo</th>
                <th className="px-4 py-3 font-medium">Usuário do alerta</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {etapas.map((etapa) => (
                <tr
                  key={etapa.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface)]"
                >
                  <td className="px-4 py-3 tabular-nums">{etapa.ordem}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/esteira/${etapa.id}`}
                      className="font-medium text-black hover:underline"
                    >
                      {etapa.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {etapa.prazoDias} dia{etapa.prazoDias === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3">{etapa.usuarioNome}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        etapa.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {etapa.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErro("");
                        setExcluindo(etapa);
                      }}
                      className="rounded-md p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
                      aria-label={`Excluir ${etapa.nome}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {etapas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[var(--muted)]"
                  >
                    Nenhuma etapa cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {excluindo && (
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
                    {podeExcluir ? "Excluir etapa" : "Atenção"}
                  </h2>
                  {podeExcluir ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Confirma a exclusão de <strong>{excluindo.nome}</strong>?
                      Esta ação não pode ser desfeita.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Não é possível excluir <strong>{excluindo.nome}</strong>.
                      Há {excluindo.reclamacoes} reclamação(ões) vinculadas a
                      esta etapa.
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
                  onClick={() => setExcluindo(null)}
                >
                  {podeExcluir ? "Cancelar" : "Fechar"}
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
        </div>
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
