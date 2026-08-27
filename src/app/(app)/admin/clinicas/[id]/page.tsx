import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ClinicaDetalheForm } from "@/components/clinica-detalhe-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClinicaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const clinica = await prisma.clinic.findUnique({ where: { id } });
  if (!clinica) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            {clinica.name}
          </h1>
          <p className="text-[var(--muted)]">Detalhes da unidade</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/clinicas">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da clínica</CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicaDetalheForm
            clinica={{
              id: clinica.id,
              name: clinica.name,
              city: clinica.city,
              state: clinica.state,
              active: clinica.active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
