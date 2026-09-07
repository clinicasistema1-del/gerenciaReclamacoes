import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EsteiraClinicaGate } from "@/components/esteira-clinica-gate";
import { EsteiraNovaForm } from "@/components/esteira-nova-form";
import { EsteiraLista } from "@/components/esteira-lista";

export default async function EsteiraPage({
  searchParams,
}: {
  searchParams: Promise<{ clinicId?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const clinicas = await prisma.clinic.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true, state: true },
  });

  const clinicId = params.clinicId?.trim() || "";
  const clinica = clinicId
    ? clinicas.find((c) => c.id === clinicId) || null
    : null;

  const completaHref = clinicId
    ? `/admin/esteira/completa?clinicId=${encodeURIComponent(clinicId)}`
    : "/admin/esteira/completa";

  if (!clinica) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-sans text-3xl font-semibold tracking-tight">
              Gestão da esteira
            </h1>
            <p className="text-[var(--muted)]">
              Selecione a clínica para cadastrar e visualizar as etapas
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={completaHref}>Visualizar esteira completa</Link>
          </Button>
        </div>

        <Card className="border-[var(--brand)] bg-[var(--surface-2)] shadow-none">
          <CardHeader>
            <CardTitle>Clínica</CardTitle>
            <p className="text-sm text-[var(--muted)]">
              Cada clínica possui a própria esteira de alertas
            </p>
          </CardHeader>
          <CardContent>
            <EsteiraClinicaGate clinicas={clinicas} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const [etapas, usuarios] = await Promise.all([
    prisma.esteiraEtapa.findMany({
      where: { clinicId: clinica.id },
      orderBy: { ordem: "asc" },
      include: {
        usuario: true,
        _count: { select: { reclamacoes: true } },
      },
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const usuariosOpts = usuarios.map((u) => ({
    id: u.id,
    name: u.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tight">
            Gestão da esteira
          </h1>
          <p className="text-[var(--muted)]">
            Fluxo de etapas, prazos e alertas de {clinica.name}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={completaHref}>Visualizar esteira completa</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clínica selecionada</CardTitle>
        </CardHeader>
        <CardContent>
          <EsteiraClinicaGate
            clinicas={clinicas}
            clinicId={clinica.id}
          />
        </CardContent>
      </Card>

      <Card className="border-[var(--brand)] bg-[var(--surface-2)] shadow-none">
        <CardHeader>
          <CardTitle>Nova etapa</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Defina a ordem, o prazo em dias e o usuário que receberá o alerta
          </p>
        </CardHeader>
        <CardContent>
          <EsteiraNovaForm
            clinicId={clinica.id}
            usuarios={usuariosOpts}
          />
        </CardContent>
      </Card>

      <EsteiraLista
        clinicId={clinica.id}
        etapas={etapas.map((e) => ({
          id: e.id,
          nome: e.nome,
          ordem: e.ordem,
          prazoDias: e.prazoDias,
          usuarioNome: e.usuario.name,
          active: e.active,
          reclamacoes: e._count.reclamacoes,
        }))}
      />
    </div>
  );
}
