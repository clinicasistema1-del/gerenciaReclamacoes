"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { updateClinic, deleteClinic } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClinicaLocalidadeFields } from "@/components/clinica-localidade-fields";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";

type Clinica = {
  id: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
  users: number;
  reclamacoes: number;
};

export function ClinicaCard({
  clinica,
  onExcluida,
}: {
  clinica: Clinica;
  onExcluida: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const podeExcluir = clinica.users === 0 && clinica.reclamacoes === 0;

  async function salvar(formData: FormData) {
    const result = await updateClinic(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    setSucesso("Clínica atualizada.");
  }

  async function confirmar() {
    if (!podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteClinic(clinica.id);
    setEnviando(false);
    if (!result.ok) {
      setErro(
        "error" in result && result.error
          ? result.error
          : `Não é possível excluir. Há ${result.users} usuário(s) e ${result.reclamacoes} reclamação(ões) vinculados.`
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
          aria-label="Excluir clínica"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <CardContent className="pt-5 pr-14">
          <form action={salvar} className="grid gap-3 md:grid-cols-5 items-end">
            <input type="hidden" name="id" value={clinica.id} />
            <div className="space-y-2 md:col-span-2">
              <Label>Nome</Label>
              <Input name="name" defaultValue={clinica.name} required />
            </div>
            <ClinicaLocalidadeFields
              idPrefix={`${clinica.id}-`}
              defaultState={clinica.state}
              defaultCity={clinica.city}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={clinica.active} />
                Ativa
              </label>
              <Button type="submit" variant="secondary" size="sm">
                Salvar
              </Button>
              <Badge
                className={
                  clinica.active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }
              >
                {clinica.active ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      {aberto && (
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
                      Confirma a exclusão de <strong>{clinica.name}</strong>?
                      Esta ação não pode ser desfeita.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Não é possível excluir <strong>{clinica.name}</strong>. Há{" "}
                      {clinica.users} usuário(s) e {clinica.reclamacoes}{" "}
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
                  onClick={() => setAberto(false)}
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

      {erro && !aberto && (
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
