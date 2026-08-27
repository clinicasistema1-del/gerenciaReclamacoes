"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { updateUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FeedbackModal,
  variantFromMessage,
} from "@/components/feedback-modal";
import { cargoLabels, roleLabels } from "@/lib/labels";
import { mascaraCpf, somenteDigitos } from "@/lib/utils";

const selectClass =
  "flex h-10 w-full cursor-pointer rounded-md border border-[var(--border)] bg-white px-3 text-sm";

function cpfMascarado(valor: string | null) {
  const digitos = somenteDigitos(valor || "");
  if (!digitos) return "";
  return digitos
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function UsuarioDetalheForm({
  usuario,
  clinicas,
}: {
  usuario: {
    id: string;
    name: string;
    email: string;
    cpf: string | null;
    senhaAcesso: string | null;
    role: string;
    cargo: string | null;
    clinicId: string | null;
    active: boolean;
  };
  clinicas: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [cpf, setCpf] = useState(cpfMascarado(usuario.cpf));
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await updateUser(formData);
    if (!result.ok) {
      setErro(result.error);
      return;
    }
    setSucesso("Usuário atualizado.");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={salvar} className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="id" value={usuario.id} />
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            defaultValue={usuario.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            value={usuario.email}
            readOnly
            className="bg-[var(--surface-2)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(mascaraCpf(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senhaAtual">Senha de login</Label>
          <div className="flex gap-2">
            <Input
              id="senhaAtual"
              type={mostrarSenha ? "text" : "password"}
              value={usuario.senhaAcesso || ""}
              readOnly
              placeholder={
                usuario.senhaAcesso
                  ? undefined
                  : "Senha não disponível para visualização"
              }
              className="bg-[var(--surface-2)]"
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={!usuario.senhaAcesso}
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={5}
            placeholder="Deixe em branco para manter"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Perfil</Label>
          <select
            id="role"
            name="role"
            defaultValue={usuario.role}
            className={selectClass}
          >
            {Object.entries(roleLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo</Label>
          <select
            id="cargo"
            name="cargo"
            defaultValue={usuario.cargo || ""}
            className={selectClass}
          >
            <option value="">Sem cargo</option>
            {Object.entries(cargoLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="clinicId">Clínica</Label>
          <select
            id="clinicId"
            name="clinicId"
            defaultValue={usuario.clinicId || ""}
            className={selectClass}
          >
            <option value="">Rede / sem unidade</option>
            {clinicas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex h-10 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={usuario.active}
              className="cursor-pointer"
            />
            Usuário ativo
          </label>
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Salvar alterações</Button>
        </div>
      </form>
      {erro && (
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
