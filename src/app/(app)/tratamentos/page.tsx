import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  statusTratamentoColors,
  statusTratamentoLabels,
} from "@/lib/labels";
import { formatDateShort } from "@/lib/utils";

export default async function TratamentosPage() {
  await requireSession();
  const tratamentos = await prisma.tratamento.findMany({
    include: {
      clinic: true,
      reclamacao: true,
      responsavel: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Tratamentos vinculados
        </h1>
        <p className="text-[var(--muted)]">
          Pacientes em cuidado após reclamação
        </p>
      </div>

      <div className="grid gap-4">
        {tratamentos.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <Link
                  href={`/tratamentos/${t.id}`}
                  className="hover:underline"
                >
                  {t.descricao}
                </Link>
                <Badge className={statusTratamentoColors[t.status]}>
                  {statusTratamentoLabels[t.status] || t.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div>
                <Link
                  href={`/reclamacoes/${t.reclamacaoId}`}
                  className="font-medium text-black hover:underline"
                >
                  {t.reclamacao.protocolo}
                </Link>
                <p className="text-[var(--muted)]">
                  {t.reclamacao.pacienteNome} · {t.clinic.name}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Responsável: {t.responsavel?.name || "—"} · Próximo:{" "}
                  {formatDateShort(t.dataProxima)}
                </p>
              </div>
              <Link
                href={`/tratamentos/${t.id}`}
                className="cursor-pointer text-sm font-medium text-black underline-offset-4 hover:underline"
              >
                Ver detalhes
              </Link>
            </CardContent>
          </Card>
        ))}
        {tratamentos.length === 0 && (
          <p className="text-[var(--muted)]">
            Nenhum tratamento vinculado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
