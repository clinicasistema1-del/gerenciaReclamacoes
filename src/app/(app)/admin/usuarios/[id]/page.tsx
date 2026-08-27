import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { UsuarioDetalheForm } from "@/components/usuario-detalhe-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UsuarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [usuario, clinicas] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: { clinic: true },
    }),
    prisma.clinic.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!usuario) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            {usuario.name}
          </h1>
          <p className="text-[var(--muted)]">Detalhes e credenciais de acesso</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/usuarios">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UsuarioDetalheForm
            usuario={{
              id: usuario.id,
              name: usuario.name,
              email: usuario.email,
              cpf: usuario.cpf,
              senhaAcesso: usuario.senhaAcesso,
              role: usuario.role,
              cargo: usuario.cargo,
              clinicId: usuario.clinicId,
              active: usuario.active,
            }}
            clinicas={clinicas}
          />
        </CardContent>
      </Card>
    </div>
  );
}
