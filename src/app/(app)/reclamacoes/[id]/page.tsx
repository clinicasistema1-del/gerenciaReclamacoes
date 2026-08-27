import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EncerrarReclamacaoButton } from "@/components/encerrar-reclamacao-button";
import { EvolucaoReclamacaoButton } from "@/components/evolucao-reclamacao-button";
import { NpsCompartilhar } from "@/components/nps-compartilhar";
import { VincularTratamentoButton } from "@/components/vincular-tratamento-button";
import {
  canalLabels,
  prioridadeLabels,
  statusColors,
  statusLabels,
  statusTratamentoColors,
  statusTratamentoLabels,
} from "@/lib/labels";
import { formatCpf, formatDate } from "@/lib/utils";

const historicoAcaoLabels: Record<string, string> = {
  ABERTURA: "Abertura",
  EVOLUCAO: "Evolução",
  ENCERRAMENTO: "Encerramento",
  CONCLUSAO: "Conclusão",
  ATRIBUICAO: "Atribuição",
  AVANCO_ETAPA: "Avanço de etapa",
  ETAPA_FINAL: "Etapa final",
  MARCADA_ATRASADA: "Marcada como atrasada",
  VINCULO_TRATAMENTO: "Vínculo com tratamento",
  RETORNO_ESTEIRA: "Retorno à esteira",
};

export default async function ReclamacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [item, usuarios, clinicas] = await Promise.all([
    prisma.reclamacao.findUnique({
      where: { id },
      include: {
        clinic: true,
        responsavel: true,
        criadoPor: true,
        motivo: true,
        servico: true,
        etapa: {
          include: { usuario: true },
        },
        historicos: {
          include: { usuario: true },
          orderBy: { createdAt: "desc" },
        },
        tratamentos: {
          include: { clinic: true, responsavel: true },
        },
        nps: true,
      },
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.clinic.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, city: true, state: true },
    }),
  ]);

  if (!item) notFound();

  const tratamento = item.tratamentos[0] ?? null;
  const tratamentoAberto = item.status === "VINCULADA_TRATAMENTO";

  const jaEncerrada =
    Boolean(item.nps) ||
    item.status === "ENCERRADA" ||
    item.status === "CONCLUIDA";

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  const npsUrl = item.nps ? `${baseUrl}/nps/${item.nps.token}` : null;
  const npsQr = npsUrl ? await QRCode.toDataURL(npsUrl) : null;

  const responsavelPadraoId =
    item.responsavel?.id || item.criadoPor.id;

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
              <p className="text-[var(--muted)]">CPF</p>
              <p className="font-medium">{formatCpf(item.pacienteCpf)}</p>
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
              <p className="font-medium">{item.motivo.descricao}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Serviço</p>
              <p className="font-medium">{item.servico?.descricao || "—"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Etapa atual</p>
              <p className="font-medium">{item.etapa?.nome || "—"}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Responsável da etapa</p>
              <p className="font-medium">
                {item.etapa?.usuario?.name || "—"}
              </p>
              {item.etapa?.usuario?.email && (
                <p className="text-xs text-[var(--muted)]">
                  {item.etapa.usuario.email}
                </p>
              )}
            </div>
            <div>
              <p className="text-[var(--muted)]">Prazo</p>
              <p className="font-medium">{formatDate(item.prazoEm)}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">
                Responsável pelo atendimento
              </p>
              <p className="font-medium">
                {item.responsavel?.name || item.criadoPor.name}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {item.responsavel?.email || item.criadoPor.email}
              </p>
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
              {!jaEncerrada && (
                <EvolucaoReclamacaoButton reclamacaoId={item.id} />
              )}
              <EncerrarReclamacaoButton
                reclamacaoId={item.id}
                jaEncerrada={jaEncerrada}
                tratamentoAberto={Boolean(tratamentoAberto)}
              />
              {item.nps && npsUrl && npsQr && (
                <NpsCompartilhar
                  protocolo={item.protocolo}
                  url={npsUrl}
                  qrDataUrl={npsQr}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tratamento</CardTitle>
              {tratamento && (
                <p className="text-sm text-[var(--muted)]">
                  Status:{" "}
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                      statusTratamentoColors[tratamento.status] || ""
                    }`}
                  >
                    {statusTratamentoLabels[tratamento.status] ||
                      tratamento.status}
                  </span>
                </p>
              )}
            </CardHeader>
            <CardContent>
              <VincularTratamentoButton
                reclamacaoId={item.id}
                tratamentoId={tratamento?.id}
                defaultResponsavelId={responsavelPadraoId}
                defaultClinicId={item.clinicId}
                usuarios={usuarios}
                clinicas={clinicas}
                disabled={jaEncerrada}
              />
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
            <div
              key={h.id}
              className="border-b border-[var(--border)] pb-3 text-sm last:border-0"
            >
              <p className="font-medium">
                {historicoAcaoLabels[h.acao] || h.acao}
              </p>
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
