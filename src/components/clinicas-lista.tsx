"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteClinic } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/feedback-modal";

type Clinica = {
  id: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
  users: number;
  reclamacoes: number;
};

export function ClinicasLista({ clinicas }: { clinicas: Clinica[] }) {
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState<Clinica | null>(null);
  const [enviando, setEnviando] = useState(false);

  const podeExcluir =
    !!excluindo && excluindo.users === 0 && excluindo.reclamacoes === 0;

  async function confirmar() {
    if (!excluindo || !podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteClinic(excluindo.id);
    setEnviando(false);
    if (!result.ok) {
      setErro(
        "error" in result && result.error
          ? result.error
          : `Não é possível excluir. Há ${result.users} usuário(s) e ${result.reclamacoes} reclamação(ões) vinculados.`
      );
      return;
    }
    setExcluindo(null);
    setSucesso("Clínica excluída.");
  }

  return (
    <>
      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Clínicas cadastradas
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {clinicas.length === 0
              ? "Nenhuma clínica cadastrada"
              : `${clinicas.length} clínica${clinicas.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clinicas.map((clinica) => (
                <tr
                  key={clinica.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clinicas/${clinica.id}`}
                      className="font-medium text-black hover:underline"
                    >
                      {clinica.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{clinica.city}</td>
                  <td className="px-4 py-3">{clinica.state}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        clinica.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {clinica.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErro("");
                        setExcluindo(clinica);
                      }}
                      className="rounded-md p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
                      aria-label={`Excluir ${clinica.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {clinicas.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[var(--muted)]"
                  >
                    Nenhuma clínica cadastrada.
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
                    {podeExcluir ? "Excluir clínica" : "Atenção"}
                  </h2>
                  {podeExcluir ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Confirma a exclusão de <strong>{excluindo.name}</strong>?
                      Esta ação não pode ser desfeita.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Não é possível excluir <strong>{excluindo.name}</strong>.
                      Há {excluindo.users} usuário(s) e {excluindo.reclamacoes}{" "}
                      reclamação(ões) vinculados a esta unidade.
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
