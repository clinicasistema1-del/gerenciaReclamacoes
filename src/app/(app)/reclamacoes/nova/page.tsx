import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReclamacaoNovaForm } from "@/components/reclamacao-nova-form";

export default async function NovaReclamacaoPage() {
  await requireSession();
  const [clinicas, usuarios] = await Promise.all([
    prisma.clinic.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Abrir reclamação
        </h1>
        <p className="text-[var(--muted)]">
          Registro manual da reclamação recebida pelo SAC
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da reclamação</CardTitle>
        </CardHeader>
        <CardContent>
          <ReclamacaoNovaForm
            clinicas={clinicas.map((c) => ({
              id: c.id,
              name: c.name,
              city: c.city,
              state: c.state,
            }))}
            usuarios={usuarios.map((u) => ({ id: u.id, name: u.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
