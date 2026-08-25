"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReclamacao } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { canalLabels, motivoLabels, prioridadeLabels } from "@/lib/labels";

export function ReclamacaoNovaForm({
  clinicas,
  usuarios,
}: {
  clinicas: { id: string; name: string; city: string; state: string }[];
  usuarios: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [clinicId, setClinicId] = useState("");
  const [canal, setCanal] = useState("WHATSAPP");
  const [motivo, setMotivo] = useState("ATENDIMENTO");
  const [prioridade, setPrioridade] = useState("MEDIA");
  const [responsavelId, setResponsavelId] = useState("");

  async function cadastrar(formData: FormData) {
    const id = await createReclamacao(formData);
    router.push(`/reclamacoes/${id}`);
  }

  return (
    <form action={cadastrar} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="pacienteNome">Nome do paciente</Label>
        <Input id="pacienteNome" name="pacienteNome" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pacienteContato">Contato</Label>
        <Input id="pacienteContato" name="pacienteContato" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clinicId">Clínica</Label>
        <SearchableSelect
          id="clinicId"
          name="clinicId"
          required
          value={clinicId}
          placeholder="Selecione ou pesquise a clínica"
          options={clinicas.map((c) => ({
            value: c.id,
            label: `${c.name} — ${c.city}/${c.state}`,
          }))}
          onChange={setClinicId}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="canal">Canal</Label>
        <SearchableSelect
          id="canal"
          name="canal"
          required
          value={canal}
          placeholder="Selecione ou pesquise o canal"
          options={Object.entries(canalLabels).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
          onChange={setCanal}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo</Label>
        <SearchableSelect
          id="motivo"
          name="motivo"
          required
          value={motivo}
          placeholder="Selecione ou pesquise o motivo"
          options={Object.entries(motivoLabels).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
          onChange={setMotivo}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="servico">Serviço</Label>
        <Input id="servico" name="servico" placeholder="Implante, prótese..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prioridade">Prioridade</Label>
        <SearchableSelect
          id="prioridade"
          name="prioridade"
          value={prioridade}
          placeholder="Selecione ou pesquise a prioridade"
          options={Object.entries(prioridadeLabels).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
          onChange={setPrioridade}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="responsavelId">Responsável pelo atendimento</Label>
        <SearchableSelect
          id="responsavelId"
          name="responsavelId"
          value={responsavelId}
          placeholder="Eu mesmo"
          options={[
            { value: "", label: "Eu mesmo" },
            ...usuarios.map((u) => ({ value: u.id, label: u.name })),
          ]}
          onChange={setResponsavelId}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" name="descricao" required />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">Criar reclamação</Button>
      </div>
    </form>
  );
}
