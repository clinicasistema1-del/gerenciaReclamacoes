"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createReclamacao } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";
import { canalLabels, prioridadeLabels } from "@/lib/labels";
import { mascaraCpf, mascaraTelefone } from "@/lib/utils";

export function ReclamacaoNovaForm({
  clinicas,
  usuarios,
  motivos,
  servicos,
}: {
  clinicas: {
    id: string;
    name: string;
    city: string;
    state: string;
    temEsteira: boolean;
  }[];
  usuarios: { id: string; name: string; clinicId: string | null }[];
  motivos: { id: string; descricao: string }[];
  servicos: { id: string; descricao: string }[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pacienteNome, setPacienteNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [canal, setCanal] = useState("WHATSAPP");
  const [motivoId, setMotivoId] = useState(motivos[0]?.id || "");
  const [servicoId, setServicoId] = useState("");
  const [prioridade, setPrioridade] = useState("MEDIA");
  const [responsavelId, setResponsavelId] = useState("");
  const [cpf, setCpf] = useState("");
  const [contato, setContato] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmacaoSemEsteira, setConfirmacaoSemEsteira] = useState(false);

  const responsaveisClinica = useMemo(
    () => usuarios.filter((u) => u.clinicId === clinicId),
    [usuarios, clinicId]
  );

  const clinicaSelecionada = useMemo(
    () => clinicas.find((c) => c.id === clinicId) || null,
    [clinicas, clinicId]
  );

  function aoSelecionarClinica(id: string) {
    setClinicId(id);
    setResponsavelId("");
  }

  async function enviarFormulario() {
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    setEnviando(true);
    const result = await createReclamacao(formData);
    setEnviando(false);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    router.push(`/reclamacoes/${result.id}`);
  }

  async function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (clinicaSelecionada && !clinicaSelecionada.temEsteira) {
      setConfirmacaoSemEsteira(true);
      return;
    }
    await enviarFormulario();
  }

  async function continuarSemEsteira() {
    setConfirmacaoSemEsteira(false);
    await enviarFormulario();
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={cadastrar}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="pacienteNome">Nome do paciente</Label>
          <Input
            id="pacienteNome"
            name="pacienteNome"
            required
            value={pacienteNome}
            onChange={(e) => setPacienteNome(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pacienteCpf">CPF</Label>
          <Input
            id="pacienteCpf"
            name="pacienteCpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(mascaraCpf(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pacienteContato">Contato</Label>
          <Input
            id="pacienteContato"
            name="pacienteContato"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            value={contato}
            onChange={(e) => setContato(mascaraTelefone(e.target.value))}
          />
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
            onChange={aoSelecionarClinica}
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
          <Label htmlFor="motivoId">Motivo</Label>
          <SearchableSelect
            id="motivoId"
            name="motivoId"
            required
            value={motivoId}
            placeholder="Selecione ou pesquise o motivo"
            options={motivos.map((m) => ({
              value: m.id,
              label: m.descricao,
            }))}
            onChange={setMotivoId}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servicoId">Serviço</Label>
          <SearchableSelect
            id="servicoId"
            name="servicoId"
            value={servicoId}
            placeholder="Selecione ou pesquise o serviço"
            options={servicos.map((s) => ({
              value: s.id,
              label: s.descricao,
            }))}
            onChange={setServicoId}
          />
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
            required
            disabled={!clinicId}
            value={responsavelId}
            placeholder={
              clinicId
                ? responsaveisClinica.length > 0
                  ? "Selecione ou pesquise o responsável"
                  : "Nenhum usuário nesta clínica"
                : "Selecione a clínica primeiro"
            }
            options={responsaveisClinica.map((u) => ({
              value: u.id,
              label: u.name,
            }))}
            onChange={setResponsavelId}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            name="descricao"
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={enviando}>
            {enviando ? "Criando..." : "Criar reclamação"}
          </Button>
        </div>
      </form>

      {confirmacaoSemEsteira && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              Esta clínica ainda não possui esteira de alertas
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              A clínica selecionada não tem etapas cadastradas. Sem esteira, a
              reclamação será aberta sem prazos e avisos automáticos por
              e-mail.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Deseja continuar mesmo assim?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmacaoSemEsteira(false)}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={continuarSemEsteira}
                disabled={enviando}
              >
                {enviando ? "Criando..." : "Continuar sem esteira"}
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
              : "Não foi possível abrir"
          }
          message={erro}
          onClose={() => setErro("")}
        />
      )}
    </>
  );
}
