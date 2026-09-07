import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { EsteiraMatriz } from "@/components/esteira-matriz";

export default async function EsteiraCompletaPage({
  searchParams,
}: {
  searchParams: Promise<{ clinicId?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const clinicId = params.clinicId?.trim() || "";
  const voltarHref = clinicId
    ? `/admin/esteira?clinicId=${encodeURIComponent(clinicId)}`
    : "/admin/esteira";

  const [clinicas, etapas] = await Promise.all([
    prisma.clinic.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, city: true, state: true },
    }),
    prisma.esteiraEtapa.findMany({
      where: { ordem: { gte: 1, lte: 10 } },
      include: {
        usuario: { select: { name: true, email: true } },
      },
    }),
  ]);

  const etapasPorClinica: Record<
    string,
    Record<
      number,
      {
        nome: string;
        prazoDias: number;
        active: boolean;
        responsavelNome: string;
        responsavelEmail: string;
      }
    >
  > = {};

  for (const etapa of etapas) {
    if (!etapasPorClinica[etapa.clinicId]) {
      etapasPorClinica[etapa.clinicId] = {};
    }
    etapasPorClinica[etapa.clinicId][etapa.ordem] = {
      nome: etapa.nome,
      prazoDias: etapa.prazoDias,
      active: etapa.active,
      responsavelNome: etapa.usuario.name,
      responsavelEmail: etapa.usuario.email,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tight">
            Esteira completa
          </h1>
          <p className="text-[var(--muted)]">
            Visão comparativa das etapas 1 a 10 por clínica
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={voltarHref}>Voltar</Link>
        </Button>
      </div>

      <EsteiraMatriz
        clinicas={clinicas}
        etapasPorClinica={etapasPorClinica}
      />
    </div>
  );
}
