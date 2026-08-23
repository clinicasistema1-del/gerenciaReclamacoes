import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { updateTratamentoStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TratamentosPage() {
  await requireSession();
  const tratamentos = await prisma.tratamento.findMany({
    include: {
      reclamacao: { include: { clinic: true } },
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
                <span>{t.descricao}</span>
                <span className="text-sm font-normal text-[var(--muted)]">
                  {t.status}
                </span>
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
                  {t.reclamacao.pacienteNome} · {t.reclamacao.clinic.name}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Responsável: {t.responsavel?.name || "—"}
                </p>
              </div>
              <form action={updateTratamentoStatus} className="flex gap-2">
                <input type="hidden" name="id" value={t.id} />
                <select
                  name="status"
                  defaultValue={t.status}
                  className="h-10 rounded-md border border-[var(--border)] px-2 text-sm"
                >
                  <option value="EM_ANDAMENTO">Em andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
                <Button type="submit" size="sm" variant="secondary">
                  Atualizar
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {tratamentos.length === 0 && (
          <p className="text-[var(--muted)]">Nenhum tratamento vinculado ainda.</p>
        )}
      </div>
    </div>
  );
}
