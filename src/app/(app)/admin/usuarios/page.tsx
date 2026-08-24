import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsuarioNovaForm } from "@/components/usuario-nova-form";
import { UsuariosLista } from "@/components/usuarios-lista";

export default async function UsuariosPage() {
  const session = await requireAdmin();
  const [usuarios, clinicas] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            reclamacoesResponsavel: true,
            reclamacoesCriadas: true,
            tratamentos: true,
            historicos: true,
          },
        },
      },
    }),
    prisma.clinic.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-3xl font-semibold tracking-tight">
          Cadastro de usuários
        </h1>
        <p className="text-[var(--muted)]">
          Quem pode acessar o sistema e com qual papel
        </p>
      </div>

      <Card className="border-[var(--brand)] bg-[var(--surface-2)] shadow-none">
        <CardHeader>
          <CardTitle>Novo usuário</CardTitle>
          <p className="text-sm text-[var(--muted)]">
            Preencha os dados para cadastrar um acesso
          </p>
        </CardHeader>
        <CardContent>
          <UsuarioNovaForm
            clinicas={clinicas
              .filter((c) => c.active)
              .map((c) => ({ id: c.id, name: c.name }))}
          />
        </CardContent>
      </Card>

      <UsuariosLista
        currentUserId={session.user.id}
        clinicas={clinicas.map((c) => ({ id: c.id, name: c.name }))}
        usuarios={usuarios.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          clinicId: u.clinicId,
          active: u.active,
          reclamacoes:
            u._count.reclamacoesResponsavel + u._count.reclamacoesCriadas,
          tratamentos: u._count.tratamentos,
          historicos: u._count.historicos,
        }))}
      />
    </div>
  );
}
