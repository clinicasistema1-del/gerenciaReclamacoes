"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { updateClinic, deleteClinic } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClinicaLocalidadeFields } from "@/components/clinica-localidade-fields";

type Clinica = {
  id: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
  users: number;
  reclamacoes: number;
};

export function ClinicaCard({ clinica }: { clinica: Clinica }) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const podeExcluir = clinica.users === 0 && clinica.reclamacoes === 0;

  async function confirmar() {
    if (!podeExcluir) return;
    setEnviando(true);
    setErro("");
    const result = await deleteClinic(clinica.id);
    setEnviando(false);
    if (!result.ok) {
      setErro(
        `Não é possível excluir. Há ${result.users} usuário(s) e ${result.reclamacoes} reclamação(ões) vinculados.`
      );
      return;
    }
    setAberto(false);
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
          <form action={updateClinic} className="grid gap-3 md:grid-cols-5 items-end">
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
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Excluir clínica</h2>
            {podeExcluir ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Confirma a exclusão de <strong>{clinica.name}</strong>? Esta ação
                não pode ser desfeita.
              </p>
            ) : (
              <p className="mt-2 text-sm text-red-700">
                Não é possível excluir <strong>{clinica.name}</strong>. Há{" "}
                {clinica.users} usuário(s) e {clinica.reclamacoes} reclamação(ões)
                vinculados a esta unidade.
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
    </>
  );
}
