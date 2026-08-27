import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EsteiraNovaForm } from "@/components/esteira-nova-form";
import { EsteiraLista } from "@/components/esteira-lista";

export default async function EsteiraPage() {
  await requireAdmin();
  const [etapas, usuarios] = await Promise.all([
    prisma.esteiraEtapa.findMany({
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
      <div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight">
          Gestão da esteira
        </h1>
        <p className="text-[var(--muted)]">
          Fluxo de etapas, prazos e alertas por e-mail
        </p>
      </div>

      <Card className="border-[var(--brand)] bg-[var(--surface-2)] shadow-none">
        <CardHeader>
          <CardTitle>Nova etapa</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Defina a ordem, o prazo em dias e o usuário que receberá o alerta
          </p>
        </CardHeader>
        <CardContent>
          <EsteiraNovaForm usuarios={usuariosOpts} />
        </CardContent>
      </Card>

      <EsteiraLista
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
