import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { updateReclamacaoStatus, createTratamento } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  canalLabels,
  motivoLabels,
  prioridadeLabels,
  statusColors,
  statusLabels,
} from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default async function ReclamacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const item = await prisma.reclamacao.findUnique({
    where: { id },
    include: {
      clinic: true,
      responsavel: true,
      criadoPor: true,
      etapa: true,
      historicos: {
        include: { usuario: true },
        orderBy: { createdAt: "desc" },
      },
      tratamentos: true,
      nps: true,
    },
  });

  if (!item) notFound();

  const usuarios = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">Protocolo</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            {item.protocolo}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={statusColors[item.status]}>
              {statusLabels[item.status]}
            </Badge>
            <Badge className="bg-[var(--surface-2)] text-[var(--ink)]">
              {prioridadeLabels[item.prioridade]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-[var(--muted)]">Paciente</p>
              <p className="font-medium">{item.pacienteNome}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Contato</p>
              <p className="font-medium">{item.pacienteContato || "—"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Clínica</p>
              <p className="font-medium">
                {item.clinic.name} ({item.clinic.city}/{item.clinic.state})
              </p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Canal</p>
              <p className="font-medium">{canalLabels[item.canal]}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Motivo</p>
              <p className="font-medium">{motivoLabels[item.motivo]}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Serviço</p>
              <p className="font-medium">{item.servico || "—"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Etapa atual</p>
              <p className="font-medium">{item.etapa?.nome || "—"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Prazo</p>
              <p className="font-medium">{formatDate(item.prazoEm)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[var(--muted)]">Descrição</p>
              <p className="mt-1 whitespace-pre-wrap">{item.descricao}</p>
            </div>
            {item.parecerFinal && (
              <div className="sm:col-span-2">
                <p className="text-[var(--muted)]">Parecer final</p>
                <p className="mt-1 whitespace-pre-wrap">{item.parecerFinal}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form action={updateReclamacaoStatus}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="acao" value="avancar" />
                <Button type="submit" className="w-full" variant="secondary">
                  Avançar etapa
                </Button>
              </form>
              <form action={updateReclamacaoStatus}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="acao" value="concluir" />
                <Button type="submit" className="w-full">
                  Concluir e gerar NPS
                </Button>
              </form>
              <form action={updateReclamacaoStatus} className="space-y-2">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="acao" value="encerrar" />
                <Label htmlFor="parecerFinal">Parecer final</Label>
                <Textarea id="parecerFinal" name="parecerFinal" />
                <Button type="submit" className="w-full" variant="outline">
                  Encerrar definitivamente
                </Button>
              </form>
              <form action={updateReclamacaoStatus} className="space-y-2">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="acao" value="atribuir" />
                <Label htmlFor="responsavelId">Responsável</Label>
                <select
                  id="responsavelId"
                  name="responsavelId"
                  defaultValue={item.responsavelId || ""}
                  className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
                >
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="w-full" variant="ghost">
                  Atualizar responsável
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tratamento vinculado</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createTratamento} className="space-y-2">
                <input type="hidden" name="reclamacaoId" value={item.id} />
                <Input name="descricao" placeholder="Descrição do cuidado" required />
                <Button type="submit" variant="secondary" className="w-full">
                  Vincular tratamento
                </Button>
              </form>
              <ul className="mt-4 space-y-2 text-sm">
                {item.tratamentos.map((t) => (
                  <li key={t.id} className="rounded-md bg-[var(--surface)] px-3 py-2">
                    {t.descricao} · {t.status}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {item.historicos.map((h) => (
            <div key={h.id} className="border-b border-[var(--border)] pb-3 text-sm last:border-0">
              <p className="font-medium">{h.acao}</p>
              <p className="text-[var(--muted)]">{h.detalhe}</p>
              <p className="text-xs text-[var(--muted)]">
                {h.usuario?.name || "Sistema"} · {formatDate(h.createdAt)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
