import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createClinic, updateClinic } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ClinicasPage() {
  await requireAdmin();
  const clinicas = await prisma.clinic.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Clínicas da franquia
        </h1>
        <p className="text-[var(--muted)]">Cadastro, edição e status das unidades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova clínica</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createClinic} className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input id="state" name="state" maxLength={2} required />
            </div>
            <div className="md:col-span-4">
              <Button type="submit">Cadastrar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {clinicas.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-5">
              <form action={updateClinic} className="grid gap-3 md:grid-cols-5 items-end">
                <input type="hidden" name="id" value={c.id} />
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome</Label>
                  <Input name="name" defaultValue={c.name} required />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input name="city" defaultValue={c.city} required />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input name="state" defaultValue={c.state} maxLength={2} required />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" defaultChecked={c.active} />
                    Ativa
                  </label>
                  <Button type="submit" variant="secondary" size="sm">
                    Salvar
                  </Button>
                  <Badge className={c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}>
                    {c.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
