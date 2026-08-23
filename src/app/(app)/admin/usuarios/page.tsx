import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createUser, updateUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roleLabels } from "@/lib/labels";

export default async function UsuariosPage() {
  await requireAdmin();
  const [usuarios, clinicas] = await Promise.all([
    prisma.user.findMany({
      include: { clinic: true },
      orderBy: { name: "asc" },
    }),
    prisma.clinic.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Cadastro de usuários
        </h1>
        <p className="text-[var(--muted)]">
          Quem pode acessar o sistema e com qual papel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <select
                id="role"
                name="role"
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
                defaultValue="SAC"
              >
                {Object.entries(roleLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicId">Clínica (opcional)</Label>
              <select
                id="clinicId"
                name="clinicId"
                className="flex h-10 w-full rounded-md border border-[var(--border)] px-3 text-sm"
              >
                <option value="">Rede / sem unidade</option>
                {clinicas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit">Cadastrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Clínica</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-[var(--border)]">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-[var(--muted)]">{u.email}</p>
                </td>
                <td className="px-4 py-3" colSpan={4}>
                  <form action={updateUser} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <Input name="name" defaultValue={u.name} className="w-40" />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="h-10 rounded-md border border-[var(--border)] px-2 text-sm"
                    >
                      {Object.entries(roleLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <select
                      name="clinicId"
                      defaultValue={u.clinicId || ""}
                      className="h-10 rounded-md border border-[var(--border)] px-2 text-sm"
                    >
                      <option value="">Rede</option>
                      {clinicas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" name="active" defaultChecked={u.active} />
                      Ativo
                    </label>
                    <Button type="submit" size="sm" variant="secondary">
                      Salvar
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
