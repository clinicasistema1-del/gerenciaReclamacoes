"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";

type Estado = { sigla: string; nome: string };

export function ClinicaLocalidadeFields({
  defaultState = "",
  defaultCity = "",
  idPrefix = "",
}: {
  defaultState?: string;
  defaultCity?: string;
  idPrefix?: string;
}) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [uf, setUf] = useState(defaultState);
  const [cidade, setCidade] = useState(defaultCity);
  const [carregandoCidades, setCarregandoCidades] = useState(false);

  useEffect(() => {
    fetch("/api/ibge/estados")
      .then((r) => r.json())
      .then((data: Estado[]) => setEstados(data))
      .catch(() => setEstados([]));
  }, []);

  useEffect(() => {
    if (!uf) {
      setCidades([]);
      setCidade("");
      return;
    }
    setCarregandoCidades(true);
    fetch(`/api/ibge/cidades?uf=${uf}`)
      .then((r) => r.json())
      .then((lista: string[]) => {
        setCidades(lista);
        setCidade((atual) => (lista.includes(atual) ? atual : ""));
      })
      .catch(() => {
        setCidades([]);
        setCidade("");
      })
      .finally(() => setCarregandoCidades(false));
  }, [uf]);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}state`}>Estado</Label>
        <SearchableSelect
          id={`${idPrefix}state`}
          name="state"
          required
          value={uf}
          placeholder="Selecione ou pesquise o estado"
          options={estados.map((e) => ({
            value: e.sigla,
            label: `${e.nome} (${e.sigla})`,
          }))}
          onChange={setUf}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}city`}>Cidade</Label>
        <SearchableSelect
          id={`${idPrefix}city`}
          name="city"
          required
          value={cidade}
          disabled={!uf || carregandoCidades}
          placeholder={
            !uf
              ? "Selecione o estado"
              : carregandoCidades
                ? "Carregando..."
                : "Selecione ou pesquise a cidade"
          }
          emptyText="Nenhuma cidade encontrada"
          options={cidades.map((nome) => ({ value: nome, label: nome }))}
          onChange={setCidade}
        />
      </div>
    </>
  );
}
