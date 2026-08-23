import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createReclamacao } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canalLabels, motivoLabels, prioridadeLabels } from "@/lib/labels";

export default async function NovaReclamacaoPage() {
  await requireSession();
  const [clinicas, usuarios] = await Promise.all([
    prisma.clinic.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  async function action(formData: FormData) {
    "use server";
    const id = await createReclamacao(formData);
    redirect(`/reclamacoes/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Abrir protocolo
        </h1>
        <p className="text-[var(--muted)]">
          Registro manual da reclamação recebida pelo SAC
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da reclamação</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-4 md:grid-cols-2">
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
              <select
                id="clinicId"
                name="clinicId"
                required
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
              >
                <option value="">Selecione</option>
                {clinicas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.city}/{c.state}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="canal">Canal</Label>
              <select
                id="canal"
                name="canal"
                required
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
              >
                {Object.entries(canalLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <select
                id="motivo"
                name="motivo"
                required
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
              >
                {Object.entries(motivoLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="servico">Serviço</Label>
              <Input id="servico" name="servico" placeholder="Implante, prótese..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <select
                id="prioridade"
                name="prioridade"
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
                defaultValue="MEDIA"
              >
                {Object.entries(prioridadeLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavelId">Responsável</Label>
              <select
                id="responsavelId"
                name="responsavelId"
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
              >
                <option value="">Eu mesmo</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" name="descricao" required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Criar protocolo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
