import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvolucaoTratamentoButton } from "@/components/evolucao-tratamento-button";
import { FinalizarTratamentoButton } from "@/components/finalizar-tratamento-button";
import {
  statusTratamentoColors,
  statusTratamentoLabels,
} from "@/lib/labels";
import { formatDate, formatDateShort } from "@/lib/utils";

const historicoAcaoLabels: Record<string, string> = {
  ABERTURA: "Abertura",
  EVOLUCAO: "Evolução",
  FINALIZACAO: "Finalização",
};

export default async function TratamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const item = await prisma.tratamento.findUnique({
    where: { id },
    include: {
      clinic: true,
      responsavel: true,
      reclamacao: {
        include: { clinic: true },
      },
      historicos: {
        include: { usuario: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!item) notFound();

  const emAndamento = item.status === "EM_ANDAMENTO";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">Tratamento</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            {item.reclamacao.pacienteNome}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={statusTratamentoColors[item.status]}>
              {statusTratamentoLabels[item.status] || item.status}
            </Badge>
            <Badge className="bg-[var(--surface-2)] text-[var(--ink)]">
              {item.reclamacao.protocolo}
            </Badge>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/reclamacoes/${item.reclamacaoId}`}>
            Ver reclamação
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="sm:col-span-2">
              <p className="text-[var(--muted)]">Descrição</p>
              <p className="mt-1 whitespace-pre-wrap font-medium">
                {item.descricao}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Clínica</p>
              <p className="font-medium">
                {item.clinic.name} ({item.clinic.city}/{item.clinic.state})
              </p>
            </div>
            <div>
              <p className="text-[var(--muted)]">
                Responsável pelo atendimento
              </p>
              <p className="font-medium">{item.responsavel?.name || "—"}</p>
              {item.responsavel?.email && (
                <p className="text-xs text-[var(--muted)]">
                  {item.responsavel.email}
                </p>
              )}
            </div>
            <div>
              <p className="text-[var(--muted)]">Próximo tratamento</p>
              <p className="font-medium">
                {formatDateShort(item.dataProxima)}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Vinculado em</p>
              <p className="font-medium">{formatDate(item.createdAt)}</p>
            </div>
            {item.finalizadoEm && (
              <div>
                <p className="text-[var(--muted)]">Finalizado em</p>
                <p className="font-medium">{formatDate(item.finalizadoEm)}</p>
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
              {emAndamento && (
                <EvolucaoTratamentoButton tratamentoId={item.id} />
              )}
              <FinalizarTratamentoButton
                tratamentoId={item.id}
                jaFinalizado={!emAndamento}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de evolução</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Retornos e andamentos registrados durante o tratamento
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {item.historicos.map((h) => (
            <div
              key={h.id}
              className="border-b border-[var(--border)] pb-3 text-sm last:border-0"
            >
              <p className="font-medium">
                {historicoAcaoLabels[h.acao] || h.acao}
              </p>
              <p className="whitespace-pre-wrap text-[var(--muted)]">
                {h.detalhe}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {h.usuario?.name || "Sistema"} · {formatDate(h.createdAt)}
              </p>
            </div>
          ))}
          {item.historicos.length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              Nenhuma evolução registrada ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
