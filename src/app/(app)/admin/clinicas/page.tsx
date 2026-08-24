import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClinicaNovaForm } from "@/components/clinica-nova-form";
import { ClinicasLista } from "@/components/clinicas-lista";

export default async function ClinicasPage() {
  await requireAdmin();
  const clinicas = await prisma.clinic.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { users: true, reclamacoes: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight">
          Clínicas da franquia
        </h1>
        <p className="text-[var(--muted)]">Cadastro, edição e status das unidades</p>
      </div>

      <Card className="border-[var(--brand)] bg-[var(--surface-2)] shadow-none">
        <CardHeader>
          <CardTitle>Nova clínica</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Cadastre uma unidade da franquia
          </p>
        </CardHeader>
        <CardContent>
          <ClinicaNovaForm />
        </CardContent>
      </Card>

      <ClinicasLista
        clinicas={clinicas.map((c) => ({
          id: c.id,
          name: c.name,
          city: c.city,
          state: c.state,
          active: c.active,
          users: c._count.users,
          reclamacoes: c._count.reclamacoes,
        }))}
      />
    </div>
  );
}
