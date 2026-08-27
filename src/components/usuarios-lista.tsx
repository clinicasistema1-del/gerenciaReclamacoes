"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteUser } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackModal } from "@/components/feedback-modal";
import { cargoLabels, roleLabels } from "@/lib/labels";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: string;
  cargo: string | null;
  clinicName: string | null;
  active: boolean;
  reclamacoes: number;
  tratamentos: number;
  historicos: number;
  etapas: number;
};

export function UsuariosLista({
  usuarios,
  currentUserId,
}: {
  usuarios: Usuario[];
  currentUserId: string;
}) {
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [excluindo, setExcluindo] = useState<Usuario | null>(null);
  const [enviando, setEnviando] = useState(false);

  const ehLogado = excluindo?.id === currentUserId;
  const podeExcluir =
    !!excluindo &&
    !ehLogado &&
    excluindo.reclamacoes === 0 &&
    excluindo.tratamentos === 0 &&
    excluindo.historicos === 0 &&
    excluindo.etapas === 0;

  async function confirmar() {
    if (!excluindo || !podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteUser(excluindo.id);
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
    setExcluindo(null);
    setSucesso("Usuário excluído.");
  }

  return (
    <>
      <section className="space-y-3 border-t border-[var(--border)] pt-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Usuários cadastrados
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {usuarios.length === 0
              ? "Nenhum usuário cadastrado"
              : `${usuarios.length} usuário${usuarios.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Clínica</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface)]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/usuarios/${usuario.id}`}
                      className="font-medium text-black hover:underline"
                    >
                      {usuario.name}
                    </Link>
                    {usuario.cargo && (
                      <p className="text-xs text-[var(--muted)]">
                        {cargoLabels[usuario.cargo] || usuario.cargo}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">{usuario.email}</td>
                  <td className="px-4 py-3">
                    {roleLabels[usuario.role] || usuario.role}
                  </td>
                  <td className="px-4 py-3">
                    {usuario.clinicName || "Rede / sem unidade"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        usuario.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {usuario.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/usuarios/${usuario.id}`}>
                          Detalhes
                        </Link>
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setErro("");
                          setExcluindo(usuario);
                        }}
                        className="rounded-md p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
                        aria-label={`Excluir ${usuario.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[var(--muted)]"
                  >
                    Nenhum usuário cadastrado.
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
                    {podeExcluir ? "Excluir usuário" : "Atenção"}
                  </h2>
                  {ehLogado ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Não é possível excluir o usuário logado.
                    </p>
                  ) : podeExcluir ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Confirma a exclusão de <strong>{excluindo.name}</strong>?
                      Esta ação não pode ser desfeita.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Não é possível excluir <strong>{excluindo.name}</strong>.
                      Há vínculos com reclamações, tratamentos, histórico ou
                      esteira.
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
