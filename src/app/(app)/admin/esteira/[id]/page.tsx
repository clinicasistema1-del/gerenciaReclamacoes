import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { EsteiraDetalheForm } from "@/components/esteira-detalhe-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EsteiraDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [etapa, usuarios] = await Promise.all([
    prisma.esteiraEtapa.findUnique({
      where: { id },
      include: { usuario: true },
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!etapa) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            {etapa.nome}
          </h1>
          <p className="text-[var(--muted)]">Detalhes da etapa da esteira</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/esteira">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <EsteiraDetalheForm
            etapa={{
              id: etapa.id,
              nome: etapa.nome,
              ordem: etapa.ordem,
              prazoDias: etapa.prazoDias,
              usuarioId: etapa.usuarioId,
              active: etapa.active,
            }}
            usuarios={usuarios}
          />
        </CardContent>
      </Card>
    </div>
  );
}
